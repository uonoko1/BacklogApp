package routes

import (
	"backend/controller"

	"github.com/labstack/echo"
)

func AuthRoutes(e *echo.Echo, authController controller.AuthController) {
	e.POST("/auth/login", authController.AuthByLogin)
	e.POST("/auth/register", authController.Create)
	e.POST("/auth/refresh", authController.RefreshAccessToken)
	e.POST("/auth/logout", authController.Logout)
}
