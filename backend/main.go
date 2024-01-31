package main

import (
	"backend/controller"
	"backend/infra"
	"backend/middleware"
	"backend/repository"
	"backend/routes"
	"backend/transaction"
	"backend/usecase"
	"fmt"
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

	fmt.Println("SECRETKEY1", os.Getenv("SECRETKEY1"))
	fmt.Println("SECRETKEY2", os.Getenv("SECRETKEY2"))
	fmt.Println("SECRETKEY3", os.Getenv("SECRETKEY3"))
	fmt.Println("BACKLOG_CLIENT_ID", os.Getenv("BACKLOG_CLIENT_ID"))
	fmt.Println("BACKLOG_CLIENT_SECRET", os.Getenv("BACKLOG_CLIENT_SECRET"))
	fmt.Println("BACKLOG_REDIRECT_URI", os.Getenv("BACKLOG_REDIRECT_URI"))

	e.Validator = &CustomerValidator{validator: validator.New()}

	db := infra.Connect()
	transaction := transaction.NewTransaction(db)
	ar := repository.NewAuthRepository(db)
	br := repository.NewBacklogRepository(db)
	au := usecase.NewAuthUsecase(ar, transaction)
	bu := usecase.NewBacklogUsecase(br)
	ac := controller.NewAuthController(au)
	bc := controller.NewBacklogController(bu)
	am := middleware.AuthMiddleware(au)

	routes.AuthRoutes(e, ac)
	routes.BacklogRoutes(e, bc, am)

	e.Start("localhost:5020")
}
