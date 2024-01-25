package model

import "time"

type User struct {
	ID        string    `json:"id"`
	UserId    string    `json:"userid"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Desc      string    `json:"desc"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserWithToken struct {
	User         *ResponseUser `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
}

type ResponseUser struct {
	UserId   string `json:"userid"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Desc     string `json:"desc"`
}
