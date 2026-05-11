package dto

type GetAssistantsRequest struct {
	RequestPagination
	CategoryId      string `json:"categoryId" validate:"uuid4"`
	Search          string `json:"q"`
	IncludeInactive bool   `json:"includeInactive" validate:"bool"`
}

type CreateAssistantRequest struct {
	CategoryId        string `json:"categoryId" validate:"required,uuid4"`
	Name              string `json:"name" validate:"required"`
	Description       string `json:"description" validate:"required"`
	Model             string `json:"model" validate:"required"`
	SystemPrompt      string `json:"systemPrompt" validate:"required"`
	ExampleUserPrompt string `json:"exampleUserPrompt"`
	IsActive          bool   `json:"isActive" validate:"bool"`
}

type GetAssistantRequest struct {
	AssistantId string `json:"assistantId" validate:"required,uuid4"`
}

type UpdateAssistantRequest struct {
	AssistantId       string `json:"assistantId" validate:"required,uuid4"`
	CategoryId        string `json:"categoryId" validate:"required,uuid4"`
	Name              string `json:"name" validate:"required"`
	Description       string `json:"description" validate:"required"`
	Model             string `json:"model" validate:"required"`
	SystemPrompt      string `json:"systemPrompt" validate:"required"`
	ExampleUserPrompt string `json:"exampleUserPrompt"`
	IsActive          *bool  `json:"isActive" validate:"required,bool"`
}

type UserGetAssistantResponse struct {
	Id                string `json:"id"`
	CategoryId        string `json:"categoryId"`
	CategoryName      string `json:"categoryName,omitempty"`
	Name              string `json:"name"`
	Description       string `json:"description"`
	Model             string `json:"model"`
	ExampleUserPrompt string `json:"exampleUserPrompt,omitempty"`
	IsActive          bool   `json:"isActive"`
	CreatedAt         string `json:"createdAt"`
	UpdatedAt         string `json:"updatedAt"`
}

type AdminGetAssistantResponse struct {
	UserGetAssistantResponse
	SystemPrompt string `json:"systemPrompt"`
}

type UserGetAssistantsResponse struct {
	Pagination ResponsePagination         `json:"pagination"`
	Assistants []UserGetAssistantResponse `json:"assistants"`
}

type AdminGetAssistantsResponse struct {
	Pagination ResponsePagination          `json:"pagination"`
	Assistants []AdminGetAssistantResponse `json:"assistants"`
}

type CreateAssistantResponse AdminGetAssistantResponse

type UpdateAssistantResponse AdminGetAssistantResponse
