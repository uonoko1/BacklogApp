package routes

import (
	"backend/controller"

	"github.com/labstack/echo"
)

func FavRoutes(e *echo.Echo, favController controller.FavController, authMiddleware echo.MiddlewareFunc) {
	e.POST("/api/fav/project/:id", favController.AddProjectToFavoriteList, authMiddleware)
	e.DELETE("/api/fav/project/:id", favController.RemoveProjectFromFavoriteList, authMiddleware)
	e.POST("/api/fav/task/:id", favController.AddTaskToFavoriteList, authMiddleware)
	e.DELETE("/api/fav/task/:id", favController.RemoveTaskFromFavoriteList, authMiddleware)
	e.GET("/api/fav/projects", favController.GetFavoriteProjects, authMiddleware)
	e.GET("/api/fav/tasks", favController.GetFavoriteTasks, authMiddleware)
}
