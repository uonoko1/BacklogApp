package usecase

import (
	"backend/model"
	"backend/repository"
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
		return "", errors.New("invalid state format: expected 'domain|encryptedUserID'")
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

	bodyBytes, _ := io.ReadAll(resp.Body)
	bodyString := string(bodyBytes)
	fmt.Println(bodyString)

	if resp.StatusCode != http.StatusOK {
		var err error
		newToken, err = b.tryRefreshToken(ctx, domain, refreshToken, resp)
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
		return nil, "", fmt.Errorf("failed to get projects, status code: %d", resp.StatusCode)
	}

	var projects []model.Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		return nil, "", err
	}

	if newToken.RefreshToken != "" {
		if err = b.r.AddBacklogRefreshToken(ctx, userId, newToken.RefreshToken, domain); err != nil {
			return nil, "", err
		}
	}

	return projects, newToken.AccessToken, nil
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
		var err error
		newToken, err := b.tryRefreshToken(ctx, domain, refreshToken, resp)
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
		return nil, "", fmt.Errorf("failed to get tasks, status code: %d", resp.StatusCode)
	}

	var tasks []model.Task
	if err := json.NewDecoder(resp.Body).Decode(&tasks); err != nil {
		return nil, "", err
	}

	if newToken.RefreshToken != "" {
		if err = b.r.AddBacklogRefreshToken(ctx, userId, newToken.RefreshToken, domain); err != nil {
			return nil, "", err
		}
	}

	return tasks, newToken.AccessToken, nil
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

func (b *backlogUsecase) tryRefreshToken(ctx context.Context, domain, refreshToken string, resp *http.Response) (*model.TokenResponse, error) {
	var errorResponse map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&errorResponse); err != nil {
		return nil, fmt.Errorf("error decoding response: %v", err)
	}

	if errorDescription, ok := errorResponse["error_description"]; !ok || errorDescription != "The access token expired" {
		return nil, fmt.Errorf("not an expired token error: %v", errorResponse)
	}

	return b.refreshAccessToken(ctx, domain, refreshToken)
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
		return nil, fmt.Errorf("failed to refresh access token, status code: %d", resp.StatusCode)
	}

	var tokenResponse model.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return nil, err
	}

	return &tokenResponse, nil
}

func decryptUserID(encryptedUserID string) (string, error) {
	// .envファイルから秘密鍵を取得（ヘキサデシマル形式の文字列）
	hexKey := os.Getenv("SECRETKEY3")

	// ヘキサデシマル文字列をバイト配列にデコード
	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return "", fmt.Errorf("failed to decode hex key: %w", err)
	}

	// Base64エンコードされた暗号テキストをデコード
	ciphertext, err := base64.URLEncoding.DecodeString(encryptedUserID)
	if err != nil {
		return "", err
	}

	// AES暗号を初期化
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// GCMモードを初期化
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// ノンスのサイズを確認
	if len(ciphertext) < gcm.NonceSize() {
		return "", errors.New("ciphertext too short")
	}

	// ノンスと暗号テキストを分離
	nonce, ciphertext := ciphertext[:gcm.NonceSize()], ciphertext[gcm.NonceSize():]

	// 暗号テキストを復号
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
