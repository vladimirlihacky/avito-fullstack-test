package dto

import "time"

type GetAssistantsRequest struct {
	RequestPagination
	CategoryId      string `validate:"uuid4"`
	Search          string
	IncludeInactive bool
}

type CreateAssistantRequest struct {
	CategoryId        string  `json:"categoryId" validate:"required,uuid4"`
	Name              string  `json:"name" validate:"required"`
	Description       string  `json:"description" validate:"required"`
	Model             string  `json:"model" validate:"required"`
	SystemPrompt      string  `json:"systemPrompt" validate:"required"`
	ExampleUserPrompt *string `json:"exampleUserPrompt"`
	IsActive          bool    `json:"isActive"`
}

type GetAssistantRequest struct {
	AssistantId string `validate:"required,uuid4"`
}

type UpdateAssistantRequest struct {
	AssistantId       string  `validate:"required,uuid4"`
	CategoryId        string  `json:"categoryId" validate:"required,uuid4"`
	Name              string  `json:"name" validate:"required"`
	Description       string  `json:"description" validate:"required"`
	Model             string  `json:"model" validate:"required"`
	SystemPrompt      string  `json:"systemPrompt" validate:"required"`
	ExampleUserPrompt *string `json:"exampleUserPrompt"`
	IsActive          *bool   `json:"isActive" validate:"required"`
}

type GetAssistantResponse struct {
	Id                string    `json:"id"`
	CategoryId        string    `json:"categoryId"`
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
