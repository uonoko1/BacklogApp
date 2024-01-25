package main

import (
	// "log"

	"github.com/labstack/echo"
)

func main() {
	// err := godotenv.Load()
	// if err != nil {
	// 	log.Fatal("Error loading .env file")
	// }
	e := echo.New()
	e.Start("localhost:5000")
}
