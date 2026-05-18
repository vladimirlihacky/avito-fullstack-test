package main

import (
	"backend/internal/handler"
	"backend/internal/provider"
	"backend/internal/repo/postgres"
	"backend/internal/service"
	"context"
	"fmt"
	"os"
	"strings"

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

	enableDummyLogin := strings.EqualFold(os.Getenv("ENABLE_DUMMY_LOGIN"), "true")

	configPath := os.Getenv("PROVIDERS_CONFIG_PATH")
	if configPath == "" {
		configPath = "./backend/providers.yml"
	}

	providersCfg, err := provider.LoadConfig(configPath)
	if err != nil {
		panic(fmt.Sprintf("Failed to load providers config: %v", err))
	}

	registry := provider.NewRegistry(providersCfg)
	if len(registry.List()) == 0 {
		panic("No providers configured")
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

	authService := service.NewAuthService(userRepo, JWTSecret)
	categoryService := service.NewCategoryService(categoryRepo)
	runService := service.NewRunService(runRepo, assistantRepo, registry)
	assistantService := service.NewAssistantService(assistantRepo, categoryRepo, registry)

	h := handler.New(
		runService,
		authService,
		categoryService,
		assistantService,
		registry,
		JWTSecret,
		enableDummyLogin,
	)
	h.SetupRoutes()
	if err := h.Listen(":8080"); err != nil {
		panic(err)
	}
}
