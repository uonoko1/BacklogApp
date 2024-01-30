package middleware

import (
	"backend/usecase"
	"net/http"
	"time"

	"github.com/labstack/echo"
)

type MiddlewareController interface {
	AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc
}

type middlewareController struct {
	u usecase.AuthUsecase
}

func NewMiddlewareController(u usecase.AuthUsecase) *middlewareController {
	return &middlewareController{u}
}

func AuthMiddleware(authUsecase usecase.AuthUsecase) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			accessTokenCookie, err := ctx.Cookie("token")
			if err != nil {
				return unauthorizedResponse(ctx, "アクセストークンが必要です")
			}

			accessToken := accessTokenCookie.Value
			user, err := authUsecase.AuthByToken(ctx.Request().Context(), accessToken)
			if err != nil {
				if err == usecase.ErrTokenExpired {
					err = handleTokenExpired(ctx, authUsecase)
					if err != nil {
						return err
					}
					return next(ctx)
				}
				return unauthorizedResponse(ctx, "認証エラーが発生しました")
			}

			ctx.Set("user", user)
			return next(ctx)
		}
	}
}

func handleTokenExpired(ctx echo.Context, authUsecase usecase.AuthUsecase) error {
	refreshTokenCookie, err := ctx.Cookie("refresh_token")
	if err != nil {
		return unauthorizedResponse(ctx, "リフレッシュトークンが必要です")
	}

	refreshToken := refreshTokenCookie.Value
	newToken, user, err := authUsecase.ReturnUserAndAccessToken(ctx.Request().Context(), refreshToken)
	if err != nil {
		return unauthorizedResponse(ctx, "リフレッシュトークンが無効です")
	}

	setNewAccessTokenCookie(ctx, newToken)
	ctx.Set("user", user)
	return nil
}

func setNewAccessTokenCookie(ctx echo.Context, token string) {
	ctx.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    token,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Now().Add(90 * 24 * time.Hour),
	})
}

func unauthorizedResponse(ctx echo.Context, message string) error {
	return ctx.JSON(http.StatusUnauthorized, map[string]interface{}{
		"error": message,
	})
}
