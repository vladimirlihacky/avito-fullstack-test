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
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		panic(err)
	}
	defer pool.Close()

	userRepo := postgres.NewUserRepo(pool)
	assistantRepo := postgres.NewAssistantRepo(pool)
	runRepo := postgres.NewRunRepo(pool)
	categoryRepo := postgres.NewCategoryRepo(pool)

	llmProvider := mock.NewProvider()

	authService := service.NewAuthService(userRepo, "secret")
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
