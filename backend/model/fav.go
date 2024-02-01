package model

import "time"

type FavoriteProject struct {
	ProjectID int       `json:"project_id"`
	CreatedAt time.Time `json:"created_at"`
}

type FavoriteTask struct {
	TaskID    int       `json:"task_id"`
	CreatedAt time.Time `json:"created_at"`
}
