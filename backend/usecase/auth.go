package usecase

import (
	"backend/config"
	"backend/model"
	"backend/repository"
	"backend/transaction"
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	AuthByLogin(ctx context.Context, email, password string) (*model.UserWithToken, error)
	AuthByToken(ctx context.Context, token string) (*model.ResponseUser, error)
	Create(ctx context.Context, user *model.User) (*model.UserWithToken, error)
	RefreshAccessToken(ctx context.Context, refreshToken string) (string, error)
	CreateRefreshToken(ctx context.Context, userId, refreshToken string) error
	Logout(ctx context.Context, refreshToken string) error
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

	responseUser := &model.ResponseUser{
		UserId:   user.UserId,
		Username: user.Username,
		Email:    user.Email,
		Desc:     nullStringToString(user.Desc),
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

func (a *authUsecase) AuthByToken(ctx context.Context, token string) (*model.ResponseUser, error) {
	email, err := a.decodeToken(token)
	if err != nil {
		return nil, err
	}

	user, err := a.r.FindUserByEmail(ctx, email)
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	responseUser := &model.ResponseUser{
		UserId:   user.UserId,
		Username: user.Username,
		Email:    user.Email,
		Desc:     nullStringToString(user.Desc),
	}

	return responseUser, nil
}

func (a *authUsecase) Create(ctx context.Context, user *model.User) (*model.UserWithToken, error) {
	result, err := a.transaction.DoInTx(ctx, func(txCtx context.Context) (any, error) {
		hashedPassword, err := hashPassword(user.Password)
		if err != nil {
			return nil, err
		}
		fmt.Println("user:", user)
		fmt.Println("パスワード:", user.Password)
		fmt.Println("ハッシュパスワード:", hashedPassword)
		err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(user.Password))
		if err != nil {
			fmt.Println("err:", err)
			return nil, err
		}
		fmt.Println("clear!")
		user.Password = hashedPassword

		createdUser, err := a.r.Create(txCtx, user)
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

		err = a.r.CreateRefreshToken(txCtx, createdUser.UserId, refreshToken)
		if err != nil {
			return nil, err
		}

		return &model.UserWithToken{
			User: &model.ResponseUser{
				UserId:   createdUser.UserId,
				Username: createdUser.Username,
				Email:    createdUser.Email,
				Desc:     nullStringToString(user.Desc),
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

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func nullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
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

func (u *authUsecase) decodeToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(config.JwtAccessTokenSecret), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		email := claims["email"].(string)
		return email, nil
	} else {
		return "", fmt.Errorf("invalid token")
	}
}
