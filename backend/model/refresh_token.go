package model

type RefreshToken struct {
	Id           int    `json:"id"`
	UserId       string `json:"userid"`
	RefreshToken string `json:"refreshtoken"`
	CreatedAt    string `json:"created_at"`
}
