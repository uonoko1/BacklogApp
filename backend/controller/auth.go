package controller

import (
	"backend/controller/request"
	"backend/usecase"
	"net/http"

	"github.com/labstack/echo"
)

type AuthController interface {
	AuthByLogin(ctx echo.Context) error
	// AuthByToken(ctx echo.Context) error
	Create(ctx echo.Context) error
}

type authController struct {
	u usecase.AuthUsecase
}

func NewAuthController(u usecase.AuthUsecase) AuthController {
	return &authController{u}
}

func (c *authController) AuthByLogin(ctx echo.Context) error {
	var req request.LoginUserRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err)
	}

	if err := ctx.Validate(req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	user, err := c.u.AuthByLogin(ctx.Request().Context(), req.Email, req.Password)
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, err.Error())
	}

	return ctx.JSON(http.StatusOK, user)
}

// func (c *authController) AuthByToken(ctx echo.Context) error {

// }

func (c *authController) Create(ctx echo.Context) error {
	var req request.CreateUserRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	if err := ctx.Validate(req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	u := request.ToModelUser(req)
	c.u.Create(ctx.Request().Context(), u)
	return nil
}
