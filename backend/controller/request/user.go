package request

import (
	"backend/model"
)

type CreateUserRequest struct {
	Username string `json:"username" validate:"required"`
	UserId   string `json:"userId" validate:"required"`
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type LoginUserRequest struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func ToModelUser(req CreateUserRequest) *model.User {
	return &model.User{
		Username: req.Username,
		UserId:   req.UserId,
		Email:    req.Email,
		Password: req.Password,
	}
}
