package main

import (
	"backend/controller"
	"backend/infra"
	"backend/repository"
	"backend/routes"
	"backend/usecase"
	"log"
	"net/http"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"
	"github.com/labstack/echo"
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
	e.Validator = &CustomerValidator{validator: validator.New()}

	db := infra.Connect()
	ar := repository.NewAuthRepository(db)
	au := usecase.NewAuthUsecase(ar)
	ac := controller.NewAuthController(au)

	routes.AuthRoutes(e, ac)

	e.Start("localhost:5000")
}
