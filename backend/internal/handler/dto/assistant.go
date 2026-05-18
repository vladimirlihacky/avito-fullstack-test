package dto

import "time"

type GetAssistantsRequest struct {
	RequestPagination
	CategoryID      *string `validate:"omitempty,uuid"`
	Search          *string
	IncludeInactive bool
}

type CreateAssistantRequest struct {
	CategoryID        string  `json:"categoryId" validate:"required,uuid"`
	Name              string  `json:"name" validate:"required"`
	Description       string  `json:"description" validate:"required"`
	Model             string  `json:"model" validate:"required"`
	SystemPrompt      string  `json:"systemPrompt" validate:"required"`
	ExampleUserPrompt *string `json:"exampleUserPrompt"`
	IsActive          bool    `json:"isActive"`
}

type GetAssistantRequest struct {
	AssistantID string `validate:"required,uuid"`
}

type UpdateAssistantRequest struct {
	AssistantID       string  `validate:"required,uuid"`
	CategoryID        string  `json:"categoryId" validate:"required,uuid"`
	Name              string  `json:"name" validate:"required"`
	Description       string  `json:"description" validate:"required"`
	Model             string  `json:"model" validate:"required"`
	SystemPrompt      string  `json:"systemPrompt" validate:"required"`
	ExampleUserPrompt *string `json:"exampleUserPrompt"`
	IsActive          *bool   `json:"isActive" validate:"required"`
}

type GetAssistantResponse struct {
	ID                string    `json:"id"`
	CategoryID        string    `json:"categoryId"`
	CategoryName      string    `json:"categoryName,omitempty"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	Model             string    `json:"model"`
	ExampleUserPrompt *string   `json:"exampleUserPrompt,omitempty"`
	IsActive          bool      `json:"isActive"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	SystemPrompt      *string   `json:"systemPrompt,omitempty"`
}

type GetAssistantsResponse struct {
	Pagination ResponsePagination     `json:"pagination"`
	Assistants []GetAssistantResponse `json:"assistants"`
}

type CreateAssistantResponse GetAssistantResponse

type UpdateAssistantResponse GetAssistantResponse
