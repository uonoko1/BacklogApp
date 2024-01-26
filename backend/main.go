package main

import (
	"backend/controller"
	"backend/infra"
	"backend/repository"
	"backend/routes"
	"backend/transaction"
	"backend/usecase"
	"log"
	"net/http"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type CustomerValidator struct {
	validator *validator.Validate
}

func (cv *CustomerValidator) Validate(i any) error {
	if err := cv.validator.Struct(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{echo.GET, echo.PUT, echo.POST, echo.DELETE, echo.PATCH},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	e.Validator = &CustomerValidator{validator: validator.New()}

	db := infra.Connect()
	transaction := transaction.NewTransaction(db)
	ar := repository.NewAuthRepository(db)
	au := usecase.NewAuthUsecase(ar, transaction)
	ac := controller.NewAuthController(au)

	routes.AuthRoutes(e, ac)

	e.Start("localhost:5000")
}
