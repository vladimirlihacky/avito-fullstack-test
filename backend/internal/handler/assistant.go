package handler

import (
	"backend/internal/domain"
	"backend/internal/handler/dto"
	"net/http"

	"github.com/google/uuid"
)

func (h *Handler) GetAssistants(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	req := dto.GetAssistantsRequest{
		RequestPagination: dto.RequestPagination{
			Page:     queryGetInt(query, "page", 1),
			PageSize: queryGetInt(query, "pageSize", 10),
		},
		CategoryId:      query.Get("categoryId"),
		Search:          query.Get("q"),
		IncludeInactive: queryGetBool(query, "includeInactive", false),
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	assistantFilter := domain.AssistantFilter{
		Pagination: domain.Pagination{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
		IncludeInactive: req.IncludeInactive,
	}

	if req.CategoryId != "" {
		categoryId := uuid.MustParse(req.CategoryId)
		assistantFilter.CategoryID = &categoryId
	}

	if req.Search != "" {
		assistantFilter.Search = req.Search
	}

	assistants, total, err := h.assistantService.GetAll(r.Context(), assistantFilter)
	if err != nil {
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	claims, _ := ClaimsFromContext(r.Context())

	response := dto.GetAssistantsResponse{
		Pagination: dto.ResponsePagination{
			Page:     req.Page,
			PageSize: req.PageSize,
			Total:    total,
		},
	}

	for _, assistant := range assistants {
		responseAssistant := dto.GetAssistantResponse{
			Id:                assistant.ID.String(),
			CategoryId:        assistant.CategoryID.String(),
			CategoryName:      assistant.CategoryName,
			Name:              assistant.Name,
			Description:       assistant.Description,
			Model:             assistant.Model,
			ExampleUserPrompt: assistant.ExampleUserPrompt,
			IsActive:          assistant.IsActive,
			CreatedAt:         assistant.CreatedAt,
			UpdatedAt:         assistant.UpdatedAt,
		}

		if claims.Role == domain.RoleAdmin {
			responseAssistant.SystemPrompt = &assistant.SystemPrompt
		}

		response.Assistants = append(response.Assistants, responseAssistant)
	}

	respondJSON(w, http.StatusOK, response)
}
