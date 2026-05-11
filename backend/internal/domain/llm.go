package domain

import "context"

type LLMRequest struct {
	Model        string
	SystemPrompt string
	UserPrompt   string
}

type LLMResponse struct {
	Output string
}

type LLMProvider interface {
	Complete(ctx context.Context, req LLMRequest) (LLMResponse, error)
}
