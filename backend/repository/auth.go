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

var userField = "id, userid, username, email, password, description, backlog_domain, backlog_refreshtoken"

func (r *authRepository) FindUserByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	query := fmt.Sprintf("SELECT %s FROM users WHERE email = ?", userField)

	err := r.db.QueryRowContext(ctx, query, email).Scan(&user.Id, &user.UserId, &user.Username, &user.Email, &user.Password, &user.Description, &user.BacklogDomain, &user.BacklogRefreshToken)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}

	return &user, nil
}

func (r *authRepository) Create(ctx context.Context, user *model.User) (*model.User, error) {
	var execer interface {
		ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
		QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
	} = r.db

	if tx, ok := ctx.Value("tx").(*sql.Tx); ok {
		execer = tx
	}

	query := `INSERT INTO users (userid, username, email, password) VALUES (?, ?, ?, ?)`
	result, err := execer.ExecContext(ctx, query, user.UserId, user.Username, user.Email, user.Password)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	query = `SELECT id, userid, username, email, password FROM users WHERE id = ?`
	row := execer.QueryRowContext(ctx, query, id)
	var newUser model.User
	if err := row.Scan(&newUser.Id, &newUser.UserId, &newUser.Username, &newUser.Email, &newUser.Password); err != nil {
		return nil, err
	}

	return &newUser, nil
}

func (r *authRepository) CreateRefreshToken(ctx context.Context, UserId, refreshToken string) error {
	var execer interface {
		ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	} = r.db

	if tx, ok := ctx.Value("tx").(*sql.Tx); ok {
		execer = tx
	}

	query := `INSERT INTO refresh_tokens (userid, refreshtoken) VALUES (?, ?)`
	_, err := execer.ExecContext(ctx, query, UserId, refreshToken)
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

	createdAtTime, err := time.Parse("2006-01-02 15:04:05", token.CreatedAt)
	if err != nil {
		return err
	}

	if createdAtTime.Add(time.Hour * 24 * 90).Before(time.Now()) {
		return errors.New("refresh token expired")
	}

	return nil
}

func (r *authRepository) DeleteRefreshToken(ctx context.Context, refreshToken string) error {
	query := `DELETE FROM refresh_tokens WHERE refreshtoken = ?`
	_, err := r.db.ExecContext(ctx, query, refreshToken)
	return err
}
