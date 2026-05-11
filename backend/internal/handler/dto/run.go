package dto

import (
	"backend/internal/domain"
	"time"
)

type CreateRunRequest struct {
	AssistantID string `validate:"required,uuid4"`
	UserPrompt  string `json:"userPrompt" validate:"required"`
}

type UserGetRunsRequest struct {
	RequestPagination
	Status *domain.RunStatus `json:"status,omitempty" validate:"omitempty,oneof=pending success failed"`
}

type AdminGetRunsRequest struct {
	UserGetRunsRequest
	AssistantID string `json:"assistantId,omitempty" validate:"omitempty,uuid4"`
}

type GetRunResponse struct {
	ID            string           `json:"id"`
	AssistantID   string           `json:"assistantId"`
	AssistantName string           `json:"assistantName"`
	CategoryId    string           `json:"categoryId"`
	CategoryName  string           `json:"categoryName"`
	UserID        string           `json:"userId"`
	Model         string           `json:"model"`
	UserPrompt    string           `json:"userPrompt"`
	Output        *string          `json:"output,omitempty"`
	Status        domain.RunStatus `json:"status"`
	Error         *string          `json:"error,omitempty"`
	CreatedAt     time.Time        `json:"createdAt"`
}

type UserGetRunsResponse struct {
	Runs       []GetRunResponse   `json:"runs"`
	Pagination ResponsePagination `json:"pagination"`
}

type AdminGetRunsResponse UserGetRunsResponse
