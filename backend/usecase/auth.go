package usecase

import (
	"backend/config"
	"backend/model"
	"backend/repository"
	"backend/transaction"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"io"
	"os"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	AuthByLogin(ctx context.Context, email, password string) (*model.UserWithToken, error)
	AuthByToken(ctx context.Context, token string) (*model.User, error)
	Create(ctx context.Context, user *model.User) (*model.UserWithToken, error)
	RefreshAccessToken(ctx context.Context, refreshToken string) (string, error)
	CreateRefreshToken(ctx context.Context, userId, refreshToken string) error
	Logout(ctx context.Context, refreshToken string) error
	ReturnUserAndAccessToken(ctx context.Context, refreshToken string) (string, *model.User, error)
}

type authUsecase struct {
	r           repository.AuthRepository
	transaction transaction.Transaction
}

func NewAuthUsecase(r repository.AuthRepository, transaction transaction.Transaction) AuthUsecase {
	return &authUsecase{r, transaction}
}

func (a *authUsecase) AuthByLogin(ctx context.Context, email, password string) (*model.UserWithToken, error) {
	user, err := a.r.FindUserByEmail(ctx, email)
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	encryptedUserID, err := EncryptUserID(user.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt user ID: %w", err)
	}

	backlogOAuth := user.BacklogRefreshToken.Valid

	responseUser := &model.ResponseUser{
		UserId:       user.UserId,
		Username:     user.Username,
		Email:        user.Email,
		Desc:         NullStringToString(user.Description),
		State:        encryptedUserID,
		BacklogOAuth: backlogOAuth,
	}

	accessToken, err := a.generateAccessTokens(user.Email)
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	refreshToken, err := a.generateRefreshTokens(user.Email)
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	err = a.r.CreateRefreshToken(ctx, responseUser.UserId, refreshToken)
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	return &model.UserWithToken{
		User:         responseUser,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (a *authUsecase) AuthByToken(ctx context.Context, token string) (*model.User, error) {
	email, err := a.decodeToken(token)
	if err != nil {
		return nil, err
	}

	user, err := a.r.FindUserByEmail(ctx, email)
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	return user, nil
}

func (a *authUsecase) Create(ctx context.Context, user *model.User) (*model.UserWithToken, error) {
	result, err := a.transaction.DoInTx(ctx, func(ctx context.Context) (any, error) {
		hashedPassword, err := hashPassword(user.Password)
		if err != nil {
			return nil, err
		}
		err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(user.Password))
		if err != nil {
			fmt.Println("err:", err)
			return nil, err
		}

		user.Password = hashedPassword

		createdUser, err := a.r.Create(ctx, user)
		if err != nil {
			return nil, err
		}

		accessToken, err := a.generateAccessTokens(user.Email)
		if err != nil {
			return nil, err
		}
		refreshToken, err := a.generateRefreshTokens(user.Email)
		if err != nil {
			return nil, err
		}

		err = a.r.CreateRefreshToken(ctx, createdUser.UserId, refreshToken)
		if err != nil {
			return nil, err
		}

		encryptedUserID, err := EncryptUserID(createdUser.Id)
		if err != nil {
			fmt.Println("failed to encrypt user ID: %w", err)
			return nil, err
		}

		return &model.UserWithToken{
			User: &model.ResponseUser{
				UserId:       createdUser.UserId,
				Username:     createdUser.Username,
				Email:        createdUser.Email,
				Desc:         NullStringToString(user.Description),
				State:        encryptedUserID,
				BacklogOAuth: false,
			},
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		}, nil
	})

	if err != nil {
		return nil, err
	}

	userWithToken, ok := result.(*model.UserWithToken)
	if !ok {
		return nil, fmt.Errorf("failed to cast result to *model.UserWithToken")
	}

	return userWithToken, nil
}

func (a *authUsecase) RefreshAccessToken(ctx context.Context, refreshToken string) (string, error) {
	err := a.r.FindRefreshToken(ctx, refreshToken)
	if err != nil {
		return "", err
	}

	email, err := a.decodeToken(refreshToken)
	if err != nil {
		return "", err
	}

	accessToken, err := a.generateAccessTokens(email)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (a *authUsecase) CreateRefreshToken(ctx context.Context, userId, refreshToken string) error {
	return a.r.CreateRefreshToken(ctx, userId, refreshToken)
}

func (a *authUsecase) Logout(ctx context.Context, refreshToken string) error {
	return a.r.DeleteRefreshToken(ctx, refreshToken)
}

func (a *authUsecase) ReturnUserAndAccessToken(ctx context.Context, refreshToken string) (string, *model.User, error) {
	err := a.r.FindRefreshToken(ctx, refreshToken)
	if err != nil {
		return "", nil, err
	}

	email, err := a.decodeToken(refreshToken)
	if err != nil {
		return "", nil, err
	}

	accessToken, err := a.generateAccessTokens(email)
	if err != nil {
		return "", nil, err
	}

	user, err := a.r.FindUserByEmail(ctx, email)
	if err != nil {
		return "", nil, err
	}

	return accessToken, user, nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func NullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func EncryptUserID(userID string) (string, error) {
	// .envファイルから秘密鍵を取得（ヘキサデシマル形式の文字列）
	hexKey := os.Getenv("SECRETKEY3")

	// ヘキサデシマル文字列をバイト配列にデコード
	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return "", fmt.Errorf("failed to decode hex key: %w", err)
	}

	// AES暗号を初期化
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	// GCMモードを初期化
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	// ユーザーIDを暗号化
	ciphertext := gcm.Seal(nonce, nonce, []byte(userID), nil)
	// Base64エンコーディングして返却
	return base64.URLEncoding.EncodeToString(ciphertext), nil
}

// トークン系関数
func (u *authUsecase) generateAccessTokens(email string) (accessToken string, err error) {
	accessTokenClaims := jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	}
	accessTokenToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessTokenClaims)
	accessToken, err = accessTokenToken.SignedString([]byte(config.JwtAccessTokenSecret))
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (u *authUsecase) generateRefreshTokens(email string) (refreshToken string, err error) {
	refreshTokenClaims := jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(time.Hour * 24 * 7).Unix(),
	}
	refreshTokenToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshTokenClaims)
	refreshToken, err = refreshTokenToken.SignedString([]byte(config.JwtRefreshTokenSecret))
	if err != nil {
		return "", err
	}

	return refreshToken, nil
}

var ErrTokenExpired = errors.New("token is expired")

func (u *authUsecase) decodeToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(config.JwtAccessTokenSecret), nil
	})

	if err != nil {
		var ve *jwt.ValidationError
		if errors.As(err, &ve) {
			if ve.Errors&jwt.ValidationErrorExpired != 0 {
				// トークンが期限切れの場合
				return "", ErrTokenExpired
			}
		}
		// その他のエラー
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		email := claims["email"].(string)
		return email, nil
	} else {
		return "", fmt.Errorf("invalid token")
	}
}
