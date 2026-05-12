package handler

import (
	"backend/internal/domain"
	"backend/internal/handler/dto"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (h *Handler) GetAssistants(w http.ResponseWriter, r *http.Request) {
	claims, _ := ClaimsFromContext(r.Context())
	query := r.URL.Query()

	req := dto.GetAssistantsRequest{
		RequestPagination: dto.RequestPagination{
			Page:     queryGetInt(query, "page", 1),
			PageSize: queryGetInt(query, "pageSize", 10),
		},
		IncludeInactive: queryGetBool(query, "includeInactive", false),
	}

	if categoryId := query.Get("categoryId"); categoryId != "" {
		req.CategoryID = &categoryId
	}

	if search := query.Get("q"); search != "" {
		req.Search = &search
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	if claims.Role != domain.RoleAdmin {
		req.IncludeInactive = false
	}

	assistantFilter := domain.AssistantFilter{
		Pagination: domain.Pagination{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
		IncludeInactive: req.IncludeInactive,
	}

	if req.CategoryID != nil {
		categoryId := uuid.MustParse(*req.CategoryID)
		assistantFilter.CategoryID = &categoryId
	}

	if req.Search != nil {
		assistantFilter.Search = *req.Search
	}

	assistants, total, err := h.assistantService.GetAll(r.Context(), assistantFilter)
	if err != nil {
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.GetAssistantsResponse{
		Pagination: dto.ResponsePagination{
			Page:     req.Page,
			PageSize: req.PageSize,
			Total:    total,
		},
		Assistants: make([]dto.GetAssistantResponse, 0),
	}

	for _, assistant := range assistants {
		responseAssistant := dto.GetAssistantResponse{
			ID:                assistant.ID.String(),
			CategoryID:        assistant.CategoryID.String(),
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

func (h *Handler) CreateAssistant(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateAssistantRequest

	if err := readJSONBody(r, &req); err != nil {
		respondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request")
		return
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	assistant := &domain.Assistant{
		CategoryID:        uuid.MustParse(req.CategoryID),
		Name:              req.Name,
		Description:       req.Description,
		Model:             req.Model,
		SystemPrompt:      req.SystemPrompt,
		ExampleUserPrompt: req.ExampleUserPrompt,
		IsActive:          req.IsActive,
	}

	createdAssistant, err := h.assistantService.Create(r.Context(), assistant)
	if err != nil {
		if errors.Is(err, domain.ErrCategoryNotFound) {
			respondError(w, http.StatusBadRequest, "CATEGORY_NOT_FOUND", "Category not found")
			return
		}
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.CreateAssistantResponse{
		ID:                createdAssistant.ID.String(),
		CategoryID:        createdAssistant.CategoryID.String(),
		CategoryName:      createdAssistant.CategoryName,
		Name:              createdAssistant.Name,
		Description:       createdAssistant.Description,
		Model:             createdAssistant.Model,
		ExampleUserPrompt: createdAssistant.ExampleUserPrompt,
		IsActive:          createdAssistant.IsActive,
		CreatedAt:         createdAssistant.CreatedAt,
		UpdatedAt:         createdAssistant.UpdatedAt,
		SystemPrompt:      &createdAssistant.SystemPrompt,
	}

	respondJSON(w, http.StatusCreated, response)
}

func (h *Handler) GetAssistant(w http.ResponseWriter, r *http.Request) {
	assistantIdStr := chi.URLParam(r, "assistantId")

	req := dto.GetAssistantRequest{
		AssistantID: assistantIdStr,
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	assistantId := uuid.MustParse(req.AssistantID)

	assistant, err := h.assistantService.GetByID(r.Context(), assistantId)
	if err != nil {
		respondError(w, http.StatusNotFound, "ASSISTANT_NOT_FOUND", "Assistant not found")
		return
	}

	claims, _ := ClaimsFromContext(r.Context())

	response := dto.GetAssistantResponse{
		ID:                assistant.ID.String(),
		CategoryID:        assistant.CategoryID.String(),
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
		response.SystemPrompt = &assistant.SystemPrompt
	}

	respondJSON(w, http.StatusOK, response)
}

func (h *Handler) UpdateAssistant(w http.ResponseWriter, r *http.Request) {
	assistantIdStr := chi.URLParam(r, "assistantId")

	var req dto.UpdateAssistantRequest

	if err := readJSONBody(r, &req); err != nil {
		respondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request")
		return
	}

	req.AssistantID = assistantIdStr

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	assistantId := uuid.MustParse(req.AssistantID)

	assistant, err := h.assistantService.GetByID(r.Context(), assistantId)
	if err != nil {
		respondError(w, http.StatusNotFound, "ASSISTANT_NOT_FOUND", "Assistant not found")
		return
	}

	assistant.CategoryID = uuid.MustParse(req.CategoryID)
	assistant.Name = req.Name
	assistant.Description = req.Description
	assistant.Model = req.Model
	assistant.SystemPrompt = req.SystemPrompt
	assistant.ExampleUserPrompt = req.ExampleUserPrompt
	assistant.IsActive = *req.IsActive

	updatedAssistant, err := h.assistantService.Update(r.Context(), assistant)
	if err != nil {
		if errors.Is(err, domain.ErrCategoryNotFound) {
			respondError(w, http.StatusBadRequest, "CATEGORY_NOT_FOUND", "Category not found")
			return
		}
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.UpdateAssistantResponse{
		ID:                updatedAssistant.ID.String(),
		CategoryID:        updatedAssistant.CategoryID.String(),
		CategoryName:      updatedAssistant.CategoryName,
		Name:              updatedAssistant.Name,
		Description:       updatedAssistant.Description,
		Model:             updatedAssistant.Model,
		ExampleUserPrompt: updatedAssistant.ExampleUserPrompt,
		IsActive:          updatedAssistant.IsActive,
		CreatedAt:         updatedAssistant.CreatedAt,
		UpdatedAt:         updatedAssistant.UpdatedAt,
		SystemPrompt:      &updatedAssistant.SystemPrompt,
	}

	respondJSON(w, http.StatusOK, response)
}

func (h *Handler) RunAssistant(w http.ResponseWriter, r *http.Request) {
	assistantIdStr := chi.URLParam(r, "assistantId")

	req := dto.CreateRunRequest{
		AssistantID: assistantIdStr,
	}

	if err := readJSONBody(r, &req); err != nil {
		respondError(w, http.StatusBadRequest, "INVALID_REQUEST", "Invalid request")
		return
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	assistantId := uuid.MustParse(assistantIdStr)

	claims, _ := ClaimsFromContext(r.Context())
	userId := claims.UserID

	run, err := h.runService.Create(r.Context(), assistantId, userId, req.UserPrompt)
	if err != nil {
		if errors.Is(err, domain.ErrAssistantInactive) {
			respondError(w, http.StatusConflict, "ASSISTANT_INACTIVE", "Assistant is inactive")
			return
		}
		if errors.Is(err, domain.ErrLLMProvider) {
			respondError(w, http.StatusBadGateway, "LLM_PROVIDER_ERROR", "LLM provider error")
			return
		}
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.GetRunResponse{
		ID:            run.ID.String(),
		AssistantID:   run.AssistantID.String(),
		AssistantName: run.AssistantName,
		CategoryID:    run.CategoryID.String(),
		CategoryName:  run.CategoryName,
		UserID:        run.UserID.String(),
		Model:         run.Model,
		UserPrompt:    run.UserPrompt,
		Output:        run.Output,
		Status:        run.Status,
		Error:         run.Error,
		CreatedAt:     run.CreatedAt,
	}

	respondJSON(w, http.StatusCreated, response)
}
