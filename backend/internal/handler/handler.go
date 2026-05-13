package handler

import (
	"backend/internal/domain"
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type runService interface {
	Create(ctx context.Context, assistantID uuid.UUID, userID uuid.UUID, userPrompt string) (*domain.Run, error)
	List(ctx context.Context, f domain.RunFilter) ([]*domain.Run, int, error)
}

type authService interface {
	DummyLogin(role domain.Role) (*domain.Token, error)
	Register(ctx context.Context, email, password string) (*domain.Token, error)
	Login(ctx context.Context, email, password string) (*domain.Token, error)
}

type categoryService interface {
	GetAll(ctx context.Context) ([]*domain.Category, error)
	Create(ctx context.Context, category *domain.Category) (*domain.Category, error)
}

type assistantService interface {
	GetAll(ctx context.Context, f domain.AssistantFilter) ([]*domain.Assistant, int, error)
	Create(ctx context.Context, assistant *domain.Assistant) (*domain.Assistant, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Assistant, error)
	Update(ctx context.Context, assistant *domain.Assistant) (*domain.Assistant, error)
}

type Handler struct {
	r                *chi.Mux
	validate         *validator.Validate
	runService       runService
	authService      authService
	categoryService  categoryService
	assistantService assistantService
	authSecret       string
}

func New(
	runService runService,
	authService authService,
	categoryService categoryService,
	assistantService assistantService,
	authSecret string,
) *Handler {
	validate := validator.New()

	return &Handler{
		validate:         validate,
		runService:       runService,
		authService:      authService,
		categoryService:  categoryService,
		assistantService: assistantService,
		authSecret:       authSecret,
	}
}

func (h *Handler) Listen(addr string) error {
	return http.ListenAndServe(addr, h.r)
}

func (h *Handler) SetupRoutes() {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	//System routes
	r.Get("/_info", h.HealthCheck)

	//Auth routes
	r.Post("/login", h.Login)
	r.Post("/register", h.Register)
	r.Post("/dummyLogin", h.DummyLogin)

	// Protected routes
	r.Route("/", func(r chi.Router) {
		r.Use(RequireAuth(h.authSecret))

		// Categories
		r.Get("/categories", h.GetCategories)
		r.With(RequireAdmin()).Post("/categories", h.CreateCategory)

		// Assistants
		r.Get("/assistants", h.GetAssistants)
		r.With(RequireAdmin()).Post("/assistants", h.CreateAssistant)
		r.Get("/assistants/{assistantId}", h.GetAssistant)
		r.With(RequireAdmin()).Put("/assistants/{assistantId}", h.UpdateAssistant)
		r.Post("/assistants/{assistantId}/run", h.RunAssistant)

		// Runs
		r.Get("/runs/my", h.GetMyRuns)
		r.With(RequireAdmin()).Get("/admin/runs", h.GetAllRuns)
	})

	h.r = r
}
