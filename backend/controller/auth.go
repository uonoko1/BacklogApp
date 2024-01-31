package controller

import (
	"backend/controller/request"
	"backend/model"
	"backend/usecase"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo"
)

type AuthController interface {
	AuthByLogin(ctx echo.Context) error
	AuthByToken(ctx echo.Context) error
	Create(ctx echo.Context) error
	RefreshAccessToken(ctx echo.Context) error
	Logout(ctx echo.Context) error
	FindUserByRefreshToken(ctx echo.Context) (*model.User, error)
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

	userWithToken, err := c.u.AuthByLogin(ctx.Request().Context(), req.Email, req.Password)
	if err != nil {
		fmt.Println("err:", err)
		return ctx.JSON(http.StatusUnauthorized, err.Error())
	}

	ctx.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    userWithToken.AccessToken,
		Path:     "/api",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 3, 0),
	})

	ctx.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    userWithToken.RefreshToken,
		Path:     "/api",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 3, 0),
	})

	return ctx.JSON(http.StatusOK, userWithToken.User)
}

func (c *authController) AuthByToken(ctx echo.Context) error {
	cookie, err := ctx.Cookie("token")
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "トークンが必要です",
			"code":  "token_required",
		})
	}

	token := cookie.Value
	user, err := c.u.AuthByToken(ctx.Request().Context(), token)
	if err != nil {
		if err == usecase.ErrTokenExpired {
			return ctx.JSON(http.StatusUnauthorized, map[string]interface{}{
				"error": "トークンが期限切れです",
				"code":  "token_expired",
			})
		}
		// その他の認証エラー
		return ctx.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": err.Error(),
			"code":  "auth_error",
		})
	}

	backlogOAuth := user.BacklogRefreshToken.Valid
	encryptedUserID, err := usecase.EncryptUserID(user.Id)
	if err != nil {
		return err
	}

	responseUser := &model.ResponseUser{
		UserId:       user.UserId,
		Username:     user.Username,
		Email:        user.Email,
		Desc:         usecase.NullStringToString(user.Description),
		State:        encryptedUserID,
		BacklogOAuth: backlogOAuth,
	}

	return ctx.JSON(http.StatusOK, responseUser)
}

func (c *authController) Create(ctx echo.Context) error {
	var req request.CreateUserRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	if err := ctx.Validate(req); err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	userWithToken, err := c.u.Create(ctx.Request().Context(), request.ToModelUser(req))
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, err.Error())
	}

	ctx.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    userWithToken.AccessToken,
		Path:     "/api",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 3, 0),
	})

	ctx.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    userWithToken.RefreshToken,
		Path:     "/api",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 3, 0),
	})

	return ctx.JSON(http.StatusOK, userWithToken.User)
}

func (c *authController) RefreshAccessToken(ctx echo.Context) error {
	cookie, err := ctx.Cookie("refresh_token")
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, "トークンが必要です")
	}

	refreshToken := cookie.Value

	token, err := c.u.RefreshAccessToken(ctx.Request().Context(), refreshToken)
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, err.Error())
	}

	ctx.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/api",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 3, 0),
	})

	return nil
}

func (c *authController) Logout(ctx echo.Context) error {
	refreshTokenCookie, err := ctx.Cookie("refresh_token")
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, "ログアウトにはリフレッシュトークンが必要です")
	}

	refreshToken := refreshTokenCookie.Value
	c.u.Logout(ctx.Request().Context(), refreshToken)

	ctx.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/api",
		HttpOnly: true,
		MaxAge:   -1,
	})
	ctx.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api",
		HttpOnly: true,
		MaxAge:   -1,
	})

	return ctx.NoContent(http.StatusOK)
}

func (c *authController) FindUserByRefreshToken(ctx echo.Context) (*model.User, error) {
	cookie, err := ctx.Cookie("refresh_token")
	if err != nil {
		return nil, err
	}

	refreshToken := cookie.Value

	token, user, err := c.u.ReturnUserAndAccessToken(ctx.Request().Context(), refreshToken)
	if err != nil {
		return nil, err
	}

	ctx.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/api",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 3, 0),
	})

	return user, nil
}
