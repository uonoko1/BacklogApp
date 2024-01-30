package repository

import (
	"backend/model"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

type AuthRepository interface {
	FindUserByEmail(ctx context.Context, email string) (*model.User, error)
	Create(ctx context.Context, user *model.User) (*model.User, error)
	CreateRefreshToken(ctx context.Context, UserId, refreshToken string) error
	FindRefreshToken(ctx context.Context, refreshToken string) error
	DeleteRefreshToken(ctx context.Context, refreshToken string) error
}

type authRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) AuthRepository {
	return &authRepository{db}
}

var userField = "userid, username, email, password, description"

func (r *authRepository) FindUserByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	query := fmt.Sprintf("SELECT %s FROM users WHERE email = ?", userField)

	err := r.db.QueryRowContext(ctx, query, email).Scan(&user.UserId, &user.Username, &user.Email, &user.Password, &user.Description)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}

	return &user, nil
}

func (r *authRepository) Create(ctx context.Context, user *model.User) (*model.User, error) {
	query := `INSERT INTO users (userid, username, email, password) VALUES (?, ?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, user.UserId, user.Username, user.Email, user.Password)
	if err != nil {
		fmt.Println("err:", err)
		return nil, err
	}

	return user, nil
}

func (r *authRepository) CreateRefreshToken(ctx context.Context, UserId, refreshToken string) error {
	query := `INSERT INTO refresh_tokens (userid, refreshtoken) VALUES (?, ?)`
	_, err := r.db.ExecContext(ctx, query, UserId, refreshToken)
	if err != nil {
		fmt.Println("err:", err)
		return err
	}
	return nil
}

func (r *authRepository) FindRefreshToken(ctx context.Context, refreshToken string) error {
	var token model.RefreshToken
	query := `SELECT id, userid, refreshtoken, created_at FROM refresh_tokens WHERE refreshtoken = ?`

	err := r.db.QueryRowContext(ctx, query, refreshToken).Scan(&token.Id, &token.UserId, &token.RefreshToken, &token.CreatedAt)
	if err != nil {
		return err
	}

	if token.CreatedAt.Add(time.Hour * 24 * 90).Before(time.Now()) {
		return errors.New("refresh token expired")
	}

	return nil
}

func (r *authRepository) DeleteRefreshToken(ctx context.Context, refreshToken string) error {
	query := `DELETE FROM refresh_tokens WHERE refreshtoken = ?`
	_, err := r.db.ExecContext(ctx, query, refreshToken)
	return err
}
