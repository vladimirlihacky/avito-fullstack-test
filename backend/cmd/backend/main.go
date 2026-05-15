package main

import (
	"backend/internal/domain"
	"backend/internal/handler"
	"backend/internal/llm/mock"
	"backend/internal/llm/openai"
	"backend/internal/repo/postgres"
	"backend/internal/service"
	"context"
	"os"
	"strconv"
	"time"

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

	provider := os.Getenv("LLM_PROVIDER")
	var llmProvider domain.LLMProvider
	switch provider {
	case "openai":
		openaiBaseURL := os.Getenv("OPENAI_BASE_URL")
		openaiAPIKey := os.Getenv("OPENAI_API_KEY")

		if openaiBaseURL == "" || openaiAPIKey == "" {
			panic("OpenAI base URL and API key must be provided")
		}
		llmProvider = openai.NewProvider(
			openaiBaseURL,
			openaiAPIKey,
		)
	default:
		latency := os.Getenv("MOCK_LLM_LATENCY")
		if latency == "" {
			latency = "800"
		}

		latencyMs, err := strconv.Atoi(latency)
		if err != nil {
			panic("Invalid latency value")
		}

		llmProvider = mock.NewProvider(time.Duration(latencyMs) * time.Millisecond)
	}

	authService := service.NewAuthService(userRepo, JWTSecret)
	categoryService := service.NewCategoryService(categoryRepo)
	runService := service.NewRunService(runRepo, assistantRepo, llmProvider)
	assistantService := service.NewAssistantService(assistantRepo, categoryRepo)

	h := handler.New(
		runService,
		authService,
		categoryService,
		assistantService,
		JWTSecret,
	)
	h.SetupRoutes()
	if err := h.Listen(":8080"); err != nil {
		panic(err)
	}
}
