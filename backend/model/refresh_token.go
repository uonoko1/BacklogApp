package model

import "time"

type RefreshToken struct {
	Id           int       `json:"id"`
	UserId       string    `json:"userid"`
	RefreshToken string    `json:"refreshtoken"`
	CreatedAt    time.Time `json:"created_at"`
}
