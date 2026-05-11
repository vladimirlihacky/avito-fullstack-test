package mock

import (
	"backend/internal/domain"
	"context"
	"fmt"
	"time"
)

type Provider struct{}

func NewProvider() *Provider {
	return &Provider{}
}

func (p *Provider) Complete(ctx context.Context, req domain.LLMRequest) (domain.LLMResponse, error) {
	select {
	case <-time.After(300 * time.Millisecond):
	case <-ctx.Done():
		return domain.LLMResponse{}, ctx.Err()
	}
	output := fmt.Sprintf("[mock] model=%s | %s", req.Model, req.UserPrompt)
	return domain.LLMResponse{Output: output}, nil
}
