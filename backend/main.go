package main

import (
	"github.com/labstack/echo"
)

func main() {
	e := echo.New()
	e.Start("localhost:5000")
}
