package handler

import (
	"backend/internal/service"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
)

type Handler struct {
	r                *chi.Mux
	validate         *validator.Validate
	runService       *service.RunService
	authService      *service.AuthService
	categoryService  *service.CategoryService
	assistantService *service.AssistantService
}

func New(
	runService *service.RunService,
	authService *service.AuthService,
	categoryService *service.CategoryService,
	assistantService *service.AssistantService,
) *Handler {
	validate := validator.New()

	return &Handler{
		validate:         validate,
		runService:       runService,
		authService:      authService,
		categoryService:  categoryService,
		assistantService: assistantService,
	}
}

func (h *Handler) SetupRoutes() {
	r := chi.NewRouter()

	//System routes
	r.Get("/_info", h.HealthCheck)

	//Auth routes
	r.Post("/login", h.Login)
	r.Post("/register", h.Register)
	r.Post("/dummyLogin", h.DummyLogin)

	h.r = r
}

func (h *Handler) Listen(addr string) error {
	return http.ListenAndServe(addr, h.r)
}
