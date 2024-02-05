package usecase

import (
	"backend/model"
	"backend/repository"
	"bytes"
	"context"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type BacklogUsecase interface {
	GetAccessTokenWithCode(ctx context.Context, code string, state string) (string, error)
	GetProjects(ctx context.Context, userId, token, domain, refreshToken string) ([]model.Project, string, error)
	GetTasks(ctx context.Context, userId, token, domain, refreshToken string) ([]model.Task, string, error)
	GetComments(ctx context.Context, userId, token, taskId, domain, refreshToken string) ([]model.Comment, string, error)
	GetMyself(ctx context.Context, userId, token, domain, refreshToken string) (string, string, error)
	GetAiComment(ctx context.Context, issueTitle, issueDescription string, existingComments []string, userName string) (string, error)
	PostComment(ctx context.Context, userId, taskId, comment, token, domain, refreshToken string) (model.Comment, string, error)
}

type backlogUsecase struct {
	r repository.BacklogRepository
}

func NewBacklogUsecase(r repository.BacklogRepository) BacklogUsecase {
	return &backlogUsecase{r}
}

func (b *backlogUsecase) GetAccessTokenWithCode(ctx context.Context, code string, state string) (string, error) {
	parts := strings.SplitN(state, "|", 2)
	if len(parts) < 2 {
		return "", errors.New("無効なstate形式: 'domain|encryptedUserID'が期待されます")
	}
	domain := parts[1]
	encryptedUserID := parts[0]

	userID, err := decryptUserID(encryptedUserID)
	if err != nil {
		return "", err
	}

	tokenURL := "https://" + domain + "/api/v2/oauth2/token"

	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("client_id", os.Getenv("BACKLOG_CLIENT_ID"))
	data.Set("client_secret", os.Getenv("BACKLOG_CLIENT_SECRET"))
	data.Set("redirect_uri", os.Getenv("BACKLOG_REDIRECT_URI"))

	req, err := http.NewRequest("POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var tokenResponse model.TokenResponse
	if err := json.Unmarshal(body, &tokenResponse); err != nil {
		return "", err
	}

	err = b.r.AddBacklogRefreshToken(ctx, userID, tokenResponse.RefreshToken, domain)
	if err != nil {
		return "", err
	}

	return tokenResponse.AccessToken, nil
}

func (b *backlogUsecase) GetProjects(ctx context.Context, userId, token, domain, refreshToken string) ([]model.Project, string, error) {
	reqURL := fmt.Sprintf("https://%s/api/v2/projects", domain)

	var newToken *model.TokenResponse = nil

	resp, err := b.requestBacklogAPI(ctx, "GET", reqURL, token, nil)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		newToken, err = b.refreshAccessToken(ctx, domain, refreshToken)
		if err != nil {
			return nil, "", err
		}
		resp, err = b.requestBacklogAPI(ctx, "GET", reqURL, newToken.AccessToken, nil)
		if err != nil {
			return nil, "", err
		}
		defer resp.Body.Close()
	}

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("projectsの取得に失敗しました, status code: %d", resp.StatusCode)
	}

	var projects []model.Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		return nil, "", fmt.Errorf("projectsのデコードに失敗しました: %v", err)
	}

	if newToken != nil && newToken.RefreshToken != "" {
		if err := b.r.AddBacklogRefreshToken(ctx, userId, newToken.RefreshToken, domain); err != nil {
			return nil, "", fmt.Errorf("refresh tokenの更新に失敗しました: %v", err)
		}

		return projects, newToken.AccessToken, nil
	}

	return projects, "", nil
}

func (b *backlogUsecase) GetTasks(ctx context.Context, userId, token, domain, refreshToken string) ([]model.Task, string, error) {
	reqURL := fmt.Sprintf("https://%s/api/v2/issues", domain)

	var newToken *model.TokenResponse = nil

	resp, err := b.requestBacklogAPI(ctx, "GET", reqURL, token, nil)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		newToken, err = b.refreshAccessToken(ctx, domain, refreshToken)
		if err != nil {
			return nil, "", err
		}
		resp, err = b.requestBacklogAPI(ctx, "GET", reqURL, newToken.AccessToken, nil)
		if err != nil {
			return nil, "", err
		}
		defer resp.Body.Close()
	}

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("tasksの取得に失敗しました, status code: %d", resp.StatusCode)
	}

	var tasks []model.Task
	if err := json.NewDecoder(resp.Body).Decode(&tasks); err != nil {
		return nil, "", fmt.Errorf("projectsのデコードに失敗しました: %v", err)
	}

	if newToken != nil && newToken.RefreshToken != "" {
		if err := b.r.AddBacklogRefreshToken(ctx, userId, newToken.RefreshToken, domain); err != nil {
			return nil, "", fmt.Errorf("refresh tokenの更新に失敗しました: %v", err)
		}

		return tasks, newToken.AccessToken, nil
	}

	return tasks, "", nil
}

func (b *backlogUsecase) GetComments(ctx context.Context, userId, token, taskId, domain, refreshToken string) ([]model.Comment, string, error) {
	reqURL := fmt.Sprintf("https://%s/api/v2/issues/%s/comments", domain, taskId)

	var newToken *model.TokenResponse = nil

	resp, err := b.requestBacklogAPI(ctx, "GET", reqURL, token, nil)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		newToken, err = b.refreshAccessToken(ctx, domain, refreshToken)
		if err != nil {
			return nil, "", err
		}
		resp, err = b.requestBacklogAPI(ctx, "GET", reqURL, newToken.AccessToken, nil)
		if err != nil {
			return nil, "", err
		}
		defer resp.Body.Close()
	}

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("commentsの取得に失敗しました, status code: %d", resp.StatusCode)
	}

	var comments []model.Comment
	if err := json.NewDecoder(resp.Body).Decode(&comments); err != nil {
		return nil, "", fmt.Errorf("commentsのデコードに失敗しました: %v", err)
	}

	if newToken != nil && newToken.RefreshToken != "" {
		if err := b.r.AddBacklogRefreshToken(ctx, userId, newToken.RefreshToken, domain); err != nil {
			return nil, "", fmt.Errorf("refresh tokenの更新に失敗しました: %v", err)
		}
		return comments, newToken.AccessToken, nil
	}

	return comments, "", nil
}

func (b *backlogUsecase) GetMyself(ctx context.Context, userId, token, domain, refreshToken string) (string, string, error) {
	reqURL := fmt.Sprintf("https://%s/api/v2/users/myself", domain)

	var newToken *model.TokenResponse = nil

	resp, err := b.requestBacklogAPI(ctx, "GET", reqURL, token, nil)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		newToken, err := b.refreshAccessToken(ctx, domain, refreshToken)
		if err != nil {
			return "", "", err
		}

		resp, err = b.requestBacklogAPI(ctx, "GET", reqURL, newToken.AccessToken, nil)
		if err != nil {
			return "", "", err
		}
		defer resp.Body.Close()
	}

	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("userの取得に失敗しました, status code: %d", resp.StatusCode)
	}

	var userInfo struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return "", "", fmt.Errorf("JSONデコーディングエラー: %v", err)
	}

	if newToken != nil && newToken.RefreshToken != "" {
		if err := b.r.AddBacklogRefreshToken(ctx, userId, newToken.RefreshToken, domain); err != nil {
			return "", "", fmt.Errorf("refresh tokenの更新に失敗しました: %v", err)
		}
		return userInfo.Name, newToken.AccessToken, nil
	}

	return userInfo.Name, "", nil
}

func (u *backlogUsecase) GetAiComment(ctx context.Context, issueTitle, issueDescription string, existingComments []string, userName string) (string, error) {
	url := "https://api.openai.com/v1/chat/completions"

	messages := []map[string]string{
		{"role": "system", "content": fmt.Sprintf("課題のタイトル: %s", issueTitle)},
		{"role": "system", "content": fmt.Sprintf("課題の説明: %s", issueDescription)},
	}

	for _, comment := range existingComments {
		messages = append(messages, map[string]string{"role": "system", "content": comment})
	}

	prompt := fmt.Sprintf("あなたは%sです。これに続く新しいコメントを生成してください。", userName)
	messages = append(messages, map[string]string{"role": "user", "content": prompt})
	fmt.Println("messages:", messages)

	requestBody, err := json.Marshal(map[string]interface{}{
		"model":    "gpt-4",
		"messages": messages,
	})
	if err != nil {
		return "", fmt.Errorf("JSONエンコーディングエラー: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return "", fmt.Errorf("HTTPリクエスト作成エラー: %v", err)
	}

	apiKey := os.Getenv("OPENAI_SECRETKEY")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("HTTPリクエスト送信エラー: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("レスポンス読み込みエラー: %v", err)
	}

	var response struct {
		Choices []struct {
			Message map[string]string `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(body, &response); err != nil {
		return "", fmt.Errorf("JSONデコーディングエラー: %v", err)
	}

	if len(response.Choices) > 0 && response.Choices[0].Message != nil {
		return response.Choices[0].Message["content"], nil
	}

	return "", fmt.Errorf("コメントが生成されませんでした")
}

func (b *backlogUsecase) PostComment(ctx context.Context, userId, taskId, comment, token, domain, refreshToken string) (model.Comment, string, error) {
	reqURL := fmt.Sprintf("https://%s/api/v2/issues/%s/comments", domain, taskId)

	commentData := map[string]string{"content": comment}
	jsonData, err := json.Marshal(commentData)
	if err != nil {
		return model.Comment{}, "", fmt.Errorf("comment dataのマーシャリングに失敗しました: %v", err)
	}

	resp, err := b.requestBacklogAPI(ctx, "POST", reqURL, token, bytes.NewBuffer(jsonData))
	if err != nil {
		return model.Comment{}, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		newToken, err := b.refreshAccessToken(ctx, domain, refreshToken)
		if err != nil {
			return model.Comment{}, "", err
		}
		resp, err = b.requestBacklogAPI(ctx, "POST", reqURL, newToken.AccessToken, bytes.NewBuffer(jsonData))
		if err != nil {
			return model.Comment{}, "", err
		}
		defer resp.Body.Close()
	}

	if resp.StatusCode != http.StatusOK {
		return model.Comment{}, "", fmt.Errorf("commentの投稿に失敗しました, status code: %d", resp.StatusCode)
	}

	var postedComment model.Comment
	if err := json.NewDecoder(resp.Body).Decode(&postedComment); err != nil {
		return model.Comment{}, "", fmt.Errorf("commentのデコードに失敗しました: %v", err)
	}

	return postedComment, "", nil
}

func (b *backlogUsecase) requestBacklogAPI(ctx context.Context, method, url, token string, body io.Reader) (*http.Response, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 10 * time.Second}
	return client.Do(req.WithContext(ctx))
}

func (b *backlogUsecase) refreshAccessToken(ctx context.Context, domain, refreshToken string) (*model.TokenResponse, error) {
	tokenURL := fmt.Sprintf("https://%s/api/v2/oauth2/token", domain)

	data := url.Values{}
	data.Set("grant_type", "refresh_token")
	data.Set("refresh_token", refreshToken)
	data.Set("client_id", os.Getenv("BACKLOG_CLIENT_ID"))
	data.Set("client_secret", os.Getenv("BACKLOG_CLIENT_SECRET"))

	req, err := http.NewRequest("POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("access tokenの更新に失敗しました, status code: %d", resp.StatusCode)
	}

	var tokenResponse model.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return nil, err
	}

	return &tokenResponse, nil
}

func decryptUserID(encryptedUserID string) (string, error) {
	hexKey := os.Getenv("SECRETKEY3")

	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return "", err
	}

	ciphertext, err := base64.URLEncoding.DecodeString(encryptedUserID)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	if len(ciphertext) < gcm.NonceSize() {
		return "", errors.New("暗号文が短すぎます")
	}

	nonce, ciphertext := ciphertext[:gcm.NonceSize()], ciphertext[gcm.NonceSize():]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
