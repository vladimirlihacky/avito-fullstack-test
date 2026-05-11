package handler

import (
	"backend/internal/auth"
	"backend/internal/domain"
	"context"
	"net/http"
	"strings"
)

type contextKey struct{}

var (
	claimsKey = contextKey{}
)

func ClaimsFromContext(ctx context.Context) (*auth.Claims, bool) {
	claims, ok := ctx.Value(claimsKey).(*auth.Claims)
	return claims, ok
}

func RequireAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := r.Header.Get("Authorization")
			if token == "" {
				respondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")
				return
			}

			token, ok := strings.CutPrefix(strings.TrimSpace(token), "Bearer ")
			if !ok {
				respondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid token")
				return
			}

			claims, err := auth.ParseToken(token, secret)
			if err != nil {
				respondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid token")
				return
			}

			ctx := context.WithValue(r.Context(), claimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireAdmin() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := ClaimsFromContext(r.Context())
			if !ok || claims.Role != domain.RoleAdmin {
				respondError(w, http.StatusForbidden, "FORBIDDEN", "Admin access required")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
