package main

import (
	"backend/controller"
	"backend/infra"
	"backend/middleware"
	"backend/repository"
	"backend/routes"
	"backend/transaction"
	"backend/usecase"
	"log"
	"net/http"
	"os"

	"github.com/go-playground/validator"
	"github.com/joho/godotenv"
	"github.com/labstack/echo"
	echoMiddleware "github.com/labstack/echo/middleware"
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
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins:     []string{os.Getenv("API_URL")},
		AllowMethods:     []string{echo.GET, echo.PUT, echo.POST, echo.DELETE, echo.PATCH},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	e.Validator = &CustomerValidator{validator: validator.New()}

	db := infra.Connect()
	transaction := transaction.NewTransaction(db)
	ar := repository.NewAuthRepository(db)
	br := repository.NewBacklogRepository(db)
	fr := repository.NewFavRepository(db)
	au := usecase.NewAuthUsecase(ar, transaction)
	bu := usecase.NewBacklogUsecase(br)
	fu := usecase.NewFavUsecase(fr)
	ac := controller.NewAuthController(au)
	bc := controller.NewBacklogController(bu)
	fc := controller.NewFavController(fu)
	am := middleware.AuthMiddleware(au)

	routes.AuthRoutes(e, ac)
	routes.BacklogRoutes(e, bc, am)
	routes.FavRoutes(e, fc, am)

	e.Start("localhost:5020")
}
