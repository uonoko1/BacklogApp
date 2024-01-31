package controller

import (
	"backend/model"
	"backend/usecase"
	"net/http"
	"time"

	"github.com/labstack/echo"
)

type BacklogController interface {
	OAuthCallback(ctx echo.Context) error
	GetProjects(ctx echo.Context) error
	GetTasks(ctx echo.Context) error
}

type backlogController struct {
	u usecase.BacklogUsecase
}

func NewBacklogController(u usecase.BacklogUsecase) BacklogController {
	return &backlogController{u}
}

func (c *backlogController) OAuthCallback(ctx echo.Context) error {
	code := ctx.QueryParam("code")
	if code == "" {
		return ctx.JSON(http.StatusBadRequest, "認証コードが必要です")
	}

	state := ctx.QueryParam("state")
	if state == "" {
		return ctx.JSON(http.StatusBadRequest, "stateパラメータが必要です")
	}

	accessToken, err := c.u.GetAccessTokenWithCode(ctx.Request().Context(), code, state)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, err.Error())
	}

	ctx.SetCookie(&http.Cookie{
		Name:     "backlog_token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		Expires:  time.Now().Add(24 * time.Hour),
	})

	return ctx.Redirect(http.StatusFound, "https://backlog.daichisakai.net")
}

func (c *backlogController) GetProjects(ctx echo.Context) error {
	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	if !user.BacklogDomain.Valid {
		return ctx.JSON(http.StatusBadRequest, "ユーザーのBacklogドメインが設定されていません")
	}

	backlogDomain := user.BacklogDomain.String

	if !user.BacklogRefreshToken.Valid {
		return ctx.JSON(http.StatusBadRequest, "ユーザーのBacklogリフレッシュトークンが設定されていません")
	}
	backlogRefreshToken := user.BacklogRefreshToken.String

	token := ""
	cookie, err := ctx.Cookie("backlog_token")
	if err == nil {
		token = cookie.Value
	}

	projects, newAccessToken, err := c.u.GetProjects(ctx.Request().Context(), user.Id, token, backlogDomain, backlogRefreshToken)
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, err.Error())
	}

	if newAccessToken != "" {
		ctx.SetCookie(&http.Cookie{
			Name:     "backlog_token",
			Value:    newAccessToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			Expires:  time.Now().Add(24 * time.Hour),
		})
	}

	return ctx.JSON(http.StatusOK, projects)
}

func (c *backlogController) GetTasks(ctx echo.Context) error {
	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	if !user.BacklogDomain.Valid {
		return ctx.JSON(http.StatusBadRequest, "ユーザーのBacklogドメインが設定されていません")
	}

	backlogDomain := user.BacklogDomain.String

	if !user.BacklogRefreshToken.Valid {
		return ctx.JSON(http.StatusBadRequest, "ユーザーのBacklogリフレッシュトークンが設定されていません")
	}
	backlogRefreshToken := user.BacklogRefreshToken.String

	token := ""
	cookie, err := ctx.Cookie("backlog_token")
	if err == nil {
		token = cookie.Value
	}

	tasks, newAccessToken, err := c.u.GetTasks(ctx.Request().Context(), user.Id, token, backlogDomain, backlogRefreshToken)
	if err != nil {
		return ctx.JSON(http.StatusUnauthorized, err.Error())
	}

	if newAccessToken != "" {
		ctx.SetCookie(&http.Cookie{
			Name:     "backlog_token",
			Value:    newAccessToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			Expires:  time.Now().Add(24 * time.Hour),
		})
	}

	return ctx.JSON(http.StatusOK, tasks)
}
