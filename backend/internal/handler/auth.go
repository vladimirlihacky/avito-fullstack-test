package handler

import (
	"backend/internal/domain"
	"backend/internal/handler/dto"
	"net/http"
)

func (h *Handler) DummyLogin(w http.ResponseWriter, r *http.Request) {
	var req dto.DummyLoginRequest

	if err := readJSONBody(r, &req); err != nil {
		respondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request")
		return
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	loginResult, err := h.authService.DummyLogin(domain.Role(req.Role))
	if err != nil {
		respondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")
		return
	}

	response := dto.LoginResponse{
		Token: loginResult.Token,
		User: dto.LoginResponseUserData{
			ID:        loginResult.User.ID.String(),
			Email:     loginResult.User.Email,
			Role:      string(loginResult.User.Role),
			CreatedAt: loginResult.User.CreatedAt,
		},
	}

	respondJSON(w, http.StatusOK, response)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest

	if err := readJSONBody(r, &req); err != nil {
		respondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request")
		return
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	loginResult, err := h.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")
		return
	}

	response := dto.LoginResponse{
		Token: loginResult.Token,
		User: dto.LoginResponseUserData{
			ID:        loginResult.User.ID.String(),
			Email:     loginResult.User.Email,
			Role:      string(loginResult.User.Role),
			CreatedAt: loginResult.User.CreatedAt,
		},
	}

	respondJSON(w, http.StatusOK, response)
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest

	if err := readJSONBody(r, &req); err != nil {
		respondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request")
		return
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	loginResult, err := h.authService.Register(r.Context(), req.Email, req.Password)
	if err != nil {
		respondError(w, http.StatusBadGateway, "UNAUTHORIZED", "UNAUTHORIZED")
		return
	}

	response := dto.LoginResponse{
		Token: loginResult.Token,
		User: dto.LoginResponseUserData{
			ID:        loginResult.User.ID.String(),
			Email:     loginResult.User.Email,
			Role:      string(loginResult.User.Role),
			CreatedAt: loginResult.User.CreatedAt,
		},
	}

	respondJSON(w, http.StatusOK, response)
}
