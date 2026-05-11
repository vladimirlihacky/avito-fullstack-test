package handler

import (
	"backend/internal/domain"
	"backend/internal/handler/dto"
	"net/http"

	"github.com/google/uuid"
)

func (h *Handler) GetMyRuns(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	req := dto.UserGetRunsRequest{
		RequestPagination: dto.RequestPagination{
			Page:     queryGetInt(query, "page", 1),
			PageSize: queryGetInt(query, "pageSize", 20),
		},
	}

	if statusStr := query.Get("status"); statusStr != "" {
		status := domain.RunStatus(statusStr)
		req.Status = &status
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	claims, _ := ClaimsFromContext(r.Context())
	userId := claims.UserID

	runFilter := domain.RunFilter{
		Pagination: domain.Pagination{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
		UserID: &userId,
		Status: req.Status,
	}

	runs, total, err := h.runService.List(r.Context(), runFilter)
	if err != nil {
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.UserGetRunsResponse{
		Pagination: dto.ResponsePagination{
			Page:     req.Page,
			PageSize: req.PageSize,
			Total:    total,
		},
		Runs: make([]dto.GetRunResponse, 0),
	}

	for _, run := range runs {
		responseRun := dto.GetRunResponse{
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

		response.Runs = append(response.Runs, responseRun)
	}

	respondJSON(w, http.StatusOK, response)
}

func (h *Handler) GetAllRuns(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	req := dto.AdminGetRunsRequest{
		UserGetRunsRequest: dto.UserGetRunsRequest{
			RequestPagination: dto.RequestPagination{
				Page:     queryGetInt(query, "page", 1),
				PageSize: queryGetInt(query, "pageSize", 10),
			},
		},
	}

	if statusStr := query.Get("status"); statusStr != "" {
		status := domain.RunStatus(statusStr)
		req.Status = &status
	}

	if assistantIdStr := query.Get("assistantId"); assistantIdStr != "" {
		req.AssistantID = assistantIdStr
	}

	if err := h.validate.Struct(req); err != nil {
		respondValidationError(w, err)
		return
	}

	runFilter := domain.RunFilter{
		Pagination: domain.Pagination{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
		Status: req.Status,
	}

	if req.AssistantID != "" {
		assistantId := uuid.MustParse(req.AssistantID)
		runFilter.AssistantID = &assistantId
	}

	runs, total, err := h.runService.List(r.Context(), runFilter)
	if err != nil {
		respondError(w, http.StatusBadGateway, "INTERNAL_ERROR", "Internal server error")
		return
	}

	response := dto.AdminGetRunsResponse{
		Pagination: dto.ResponsePagination{
			Page:     req.Page,
			PageSize: req.PageSize,
			Total:    total,
		},
		Runs: make([]dto.GetRunResponse, 0),
	}

	for _, run := range runs {
		responseRun := dto.GetRunResponse{
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

		response.Runs = append(response.Runs, responseRun)
	}

	respondJSON(w, http.StatusOK, response)
}
