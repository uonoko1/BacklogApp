package controller

import (
	"backend/model"
	"backend/usecase"
	"net/http"
	"strconv"

	"github.com/labstack/echo"
)

type FavController interface {
	AddProjectToFavoriteList(ctx echo.Context) error
	RemoveProjectFromFavoriteList(ctx echo.Context) error
	AddTaskToFavoriteList(ctx echo.Context) error
	RemoveTaskFromFavoriteList(ctx echo.Context) error
	GetFavoriteProjects(ctx echo.Context) error
	GetFavoriteTasks(ctx echo.Context) error
}

type favController struct {
	u usecase.FavUsecase
}

func NewFavController(u usecase.FavUsecase) FavController {
	return &favController{u}
}

func (c *favController) AddProjectToFavoriteList(ctx echo.Context) error {
	idStr := ctx.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "ID formatが不正です",
		})
	}

	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	numUserId, err := strconv.Atoi(user.Id)
	if err != nil {
		return err
	}

	err = c.u.AddProjectToFavoriteList(ctx.Request().Context(), numUserId, id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.NoContent(http.StatusOK)
}

func (c *favController) RemoveProjectFromFavoriteList(ctx echo.Context) error {
	idStr := ctx.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "ID formatが不正です",
		})
	}

	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	numUserId, err := strconv.Atoi(user.Id)
	if err != nil {
		return err
	}

	err = c.u.RemoveProjectFromFavoriteList(ctx.Request().Context(), numUserId, id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.NoContent(http.StatusOK)
}

func (c *favController) AddTaskToFavoriteList(ctx echo.Context) error {
	idStr := ctx.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "ID formatが不正です",
		})
	}

	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	numUserId, err := strconv.Atoi(user.Id)
	if err != nil {
		return err
	}

	err = c.u.AddTaskToFavoriteList(ctx.Request().Context(), numUserId, id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.NoContent(http.StatusOK)
}

func (c *favController) RemoveTaskFromFavoriteList(ctx echo.Context) error {
	idStr := ctx.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "ID formatが不正です",
		})
	}

	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	numUserId, err := strconv.Atoi(user.Id)
	if err != nil {
		return err
	}

	err = c.u.RemoveTaskFromFavoriteList(ctx.Request().Context(), numUserId, id)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.NoContent(http.StatusOK)
}

func (c *favController) GetFavoriteProjects(ctx echo.Context) error {
	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	numUserId, err := strconv.Atoi(user.Id)
	if err != nil {
		return err
	}

	projects, err := c.u.GetFavoriteProjects(ctx.Request().Context(), numUserId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, projects)
}

func (c *favController) GetFavoriteTasks(ctx echo.Context) error {
	tempUser := ctx.Get("user")
	user, ok := tempUser.(*model.User)
	if !ok {
		return ctx.JSON(http.StatusInternalServerError, "ユーザー情報の取得に失敗しました")
	}

	numUserId, err := strconv.Atoi(user.Id)
	if err != nil {
		return err
	}

	tasks, err := c.u.GetFavoriteTasks(ctx.Request().Context(), numUserId)
	if err != nil {
		return ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return ctx.JSON(http.StatusOK, tasks)
}
