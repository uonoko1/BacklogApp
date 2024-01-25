package model

import "time"

type RefreshToken struct {
	ID           int       `json:"id"`
	UserID       string    `json:"userid"`
	RefreshToken string    `json:"refreshtoken"`
	CreatedAt    time.Time `json:"created_at"`
}
