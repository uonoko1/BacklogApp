package routes

import (
	"backend/controller"

	"github.com/labstack/echo"
)

func AuthRoutes(e *echo.Echo, authController controller.AuthController) {
	e.POST("/api/auth/login", authController.AuthByLogin)
	e.POST("/api/auth/register", authController.Create)
	e.GET("/api/auth/user", authController.AuthByToken)
	e.POST("/api/auth/refresh", authController.RefreshAccessToken)
	e.DELETE("/api/auth/logout", authController.Logout)
}
