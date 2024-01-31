package routes

import (
	"backend/controller"

	"github.com/labstack/echo"
)

func BacklogRoutes(e *echo.Echo, backlogController controller.BacklogController, authMiddleware echo.MiddlewareFunc) {
	e.POST("/api/backlog", backlogController.OAuthCallback)
	e.GET("/api/backlog/projects", backlogController.GetProjects, authMiddleware)
	e.GET("/api/backlog/tasks", backlogController.GetTasks, authMiddleware)
}