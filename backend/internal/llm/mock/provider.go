package mock

import (
	"backend/internal/domain"
	"context"
	"fmt"
	"time"
)

type Provider struct {
	latency time.Duration
}

func NewProvider(latency time.Duration) *Provider {
	return &Provider{
		latency: latency,
	}
}

func (p *Provider) Complete(ctx context.Context, req domain.LLMRequest) (domain.LLMResponse, error) {
	select {
	case <-time.After(p.latency):
	case <-ctx.Done():
		return domain.LLMResponse{}, ctx.Err()
	}
	output := fmt.Sprintf("[mock] model=%s | %s", req.Model, req.UserPrompt)
	return domain.LLMResponse{Output: output}, nil
}
