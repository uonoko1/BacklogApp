package model

type FavoriteProject struct {
	ProjectID int    `json:"project_id"`
	CreatedAt string `json:"created_at"`
}

type FavoriteTask struct {
	TaskID    int    `json:"task_id"`
	CreatedAt string `json:"created_at"`
}
