package repository

import (
	"context"
	"database/sql"
)

type BacklogRepository interface {
	AddBacklogRefreshToken(ctx context.Context, userId, refreshToken, domain string) error
}

type backlogRepository struct {
	db *sql.DB
}

func NewBacklogRepository(db *sql.DB) BacklogRepository {
	return &backlogRepository{db}
}

func (r *backlogRepository) AddBacklogRefreshToken(ctx context.Context, id, refreshToken, domain string) error {
	query := `UPDATE users SET backlog_refreshtoken = ?, backlog_domain = ? WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, refreshToken, domain, id)
	if err != nil {
		return err
	}
	return nil
}
