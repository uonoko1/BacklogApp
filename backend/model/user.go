package model

import (
	"database/sql"
	"time"
)

type User struct {
	Id                  string         `json:"id"`
	UserId              string         `json:"userid"`
	Username            string         `json:"username"`
	Email               string         `json:"email"`
	Password            string         `json:"password"`
	Description         sql.NullString `json:"description"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	BacklogRefreshToken sql.NullString `json:"backlog_refreshtoken"`
	BacklogDomain       sql.NullString `json:"backlog_domain"`
}

type UserWithToken struct {
	User         *ResponseUser `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
}

type ResponseUser struct {
	UserId       string `json:"userid"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	Desc         string `json:"desc"`
	State        string `json:"state"`
	BacklogOAuth bool   `json:"backlog_oauth"`
}
