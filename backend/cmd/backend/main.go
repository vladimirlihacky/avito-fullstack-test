package main

import (
	"backend/internal/handler"
	"backend/internal/llm/mock"
	"backend/internal/repo/postgres"
	"backend/internal/service"
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		panic("No database url provided")
	}
	JWTSecret := os.Getenv("JWT_SECRET")
	if JWTSecret == "" {
		JWTSecret = "secret"
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		panic(err)
	}
	defer pool.Close()

	userRepo := postgres.NewUserRepo(pool)
	assistantRepo := postgres.NewAssistantRepo(pool)
	runRepo := postgres.NewRunRepo(pool)
	categoryRepo := postgres.NewCategoryRepo(pool)

	llmProvider := mock.NewProvider()

	authService := service.NewAuthService(userRepo, JWTSecret)
	categoryService := service.NewCategoryService(categoryRepo)
	runService := service.NewRunService(runRepo, assistantRepo, llmProvider)
	assistantService := service.NewAssistantService(assistantRepo, categoryRepo)

	h := handler.New(
		runService,
		authService,
		categoryService,
		assistantService,
	)
	h.SetupRoutes()
	h.Listen(":8080")
}
