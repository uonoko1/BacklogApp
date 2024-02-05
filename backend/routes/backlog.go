package routes

import (
	"backend/controller"

	"github.com/labstack/echo"
)

func BacklogRoutes(e *echo.Echo, backlogController controller.BacklogController, authMiddleware echo.MiddlewareFunc) {
	e.GET("/api/backlog", backlogController.OAuthCallback)
	e.GET("/api/backlog/projects", backlogController.GetProjects, authMiddleware)
	e.GET("/api/backlog/tasks", backlogController.GetTasks, authMiddleware)
	e.GET("/api/backlog/comments/:taskId", backlogController.GetComments, authMiddleware)
	e.POST("/api/backlog/autoComment", backlogController.GetAiComment, authMiddleware)
	e.POST("/api/backlog/comment/submit", backlogController.PostComment, authMiddleware)
	e.GET("/api/backlog/myself", backlogController.GetMyself, authMiddleware)
}
