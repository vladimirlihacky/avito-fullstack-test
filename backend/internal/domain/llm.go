package domain

import "context"

type LLMRequest struct {
	Model        string
	SystemPrompt string
	UserPrompt   string
}

type LLMResponse struct {
	Output string
	Error  error
}

type LLMResponseStream struct {
	OutputChan <-chan string
	ErrorChan  <-chan error
}

type LLMProvider interface {
	Complete(ctx context.Context, req LLMRequest) LLMResponse
	CompleteStream(ctx context.Context, req LLMRequest) LLMResponseStream
}

type ProviderRegistry interface {
	Get(name string) (LLMProvider, error)
	Exists(name string) bool
}
