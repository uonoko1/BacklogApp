package repository

import (
	"backend/model"
	"context"
	"database/sql"
)

type FavRepository interface {
	AddProjectToFavoriteList(ctx context.Context, userId, projectId int) error
	RemoveProjectFromFavoriteList(ctx context.Context, userId, projectId int) error
	AddTaskToFavoriteList(ctx context.Context, userId, taskId int) error
	RemoveTaskFromFavoriteList(ctx context.Context, userId, taskId int) error
	GetFavoriteProjects(ctx context.Context, userId int) ([]model.FavoriteProject, error)
	GetFavoriteTasks(ctx context.Context, userId int) ([]model.FavoriteTask, error)
}

type favRepository struct {
	db *sql.DB
}

func NewFavRepository(db *sql.DB) FavRepository {
	return &favRepository{db}
}

func (r *favRepository) AddProjectToFavoriteList(ctx context.Context, userId, projectId int) error {
	query := `INSERT INTO fav_projects (user_id, project_id) VALUES (?, ?)
              ON DUPLICATE KEY UPDATE project_id = project_id;`

	_, err := r.db.ExecContext(ctx, query, userId, projectId)
	if err != nil {
		return err
	}

	return nil
}

func (r *favRepository) RemoveProjectFromFavoriteList(ctx context.Context, userId, projectId int) error {
	query := `DELETE FROM fav_projects WHERE user_id = ? AND project_id = ?;`

	_, err := r.db.ExecContext(ctx, query, userId, projectId)
	if err != nil {
		return err
	}

	return nil
}

func (r *favRepository) AddTaskToFavoriteList(ctx context.Context, userId, taskId int) error {
	query := `INSERT INTO fav_tasks (user_id, task_id) VALUES (?, ?)
              ON DUPLICATE KEY UPDATE task_id = task_id;`

	_, err := r.db.ExecContext(ctx, query, userId, taskId)
	if err != nil {
		return err
	}

	return nil
}

func (r *favRepository) RemoveTaskFromFavoriteList(ctx context.Context, userId, taskId int) error {
	query := `DELETE FROM fav_tasks WHERE user_id = ? AND task_id = ?;`

	_, err := r.db.ExecContext(ctx, query, userId, taskId)
	if err != nil {
		return err
	}

	return nil
}

func (r *favRepository) GetFavoriteProjects(ctx context.Context, userId int) ([]model.FavoriteProject, error) {
	var favoriteProjects []model.FavoriteProject

	query := `SELECT project_id, created_at FROM fav_projects WHERE user_id = ?;`
	rows, err := r.db.QueryContext(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var fp model.FavoriteProject
		if err := rows.Scan(&fp.ProjectID, &fp.CreatedAt); err != nil {
			return nil, err
		}
		favoriteProjects = append(favoriteProjects, fp)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return favoriteProjects, nil
}

func (r *favRepository) GetFavoriteTasks(ctx context.Context, userId int) ([]model.FavoriteTask, error) {
	var favoriteTasks []model.FavoriteTask

	query := `SELECT task_id, created_at FROM fav_tasks WHERE user_id = ?;`
	rows, err := r.db.QueryContext(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var ft model.FavoriteTask
		if err := rows.Scan(&ft.TaskID, &ft.CreatedAt); err != nil {
			return nil, err
		}
		favoriteTasks = append(favoriteTasks, ft)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return favoriteTasks, nil
}
