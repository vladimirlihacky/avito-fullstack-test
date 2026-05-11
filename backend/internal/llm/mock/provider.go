package mock

import (
	"backend/internal/domain"
	"context"
	"fmt"
)

type Provider struct{}

func NewProvider() *Provider {
	return &Provider{}
}

func (p *Provider) Complete(ctx context.Context, req domain.LLMRequest) (domain.LLMResponse, error) {
	output := fmt.Sprintf("[mock] model=%s | %s", req.Model, req.UserPrompt)
	return domain.LLMResponse{Output: output}, nil
}
