package handler

import (
	"backend/internal/domain"
	"backend/internal/handler/dto"
	"net/http"
)

func (h *Handler) GetCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.categoryService.GetAll(r.Context())

	if err != nil {
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.GetCategoriesResponse{
		Categories: make([]dto.GetCategoryResponse, 0),
	}

	for _, category := range categories {
		responseCategory := dto.GetCategoryResponse{
			ID:          category.ID.String(),
			Name:        category.Name,
			Description: category.Description,
			CreatedAt:   &category.CreatedAt,
		}

		response.Categories = append(response.Categories, responseCategory)
	}

	respondJSON(w, http.StatusOK, response)
}

func (h *Handler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateCategoryRequest

	if err := readJSONBody(r, &req); err != nil {
		respondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request")
		return
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	category, err := h.categoryService.Create(r.Context(), &domain.Category{
		Name:        req.Name,
		Description: req.Description,
	})
	if err != nil {
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.CreateCategoryResponse{
		ID:          category.ID.String(),
		Name:        category.Name,
		Description: category.Description,
		CreatedAt:   &category.CreatedAt,
	}

	respondJSON(w, http.StatusCreated, response)
}
