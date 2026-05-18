package mock

import (
	"backend/internal/domain"
	"context"
	"fmt"
	"strings"
	"time"
)

type Provider struct {
	latency time.Duration
}

func NewProvider(latency time.Duration) domain.LLMProvider {
	return &Provider{
		latency: latency,
	}
}

func (p *Provider) Complete(ctx context.Context, req domain.LLMRequest) domain.LLMResponse {
	select {
	case <-time.After(p.latency):
	case <-ctx.Done():
		return domain.LLMResponse{Error: ctx.Err()}
	}
	output := fmt.Sprintf("[mock] model=%s | %s", req.Model, req.UserPrompt)
	return domain.LLMResponse{
		Output: output,
		Error:  nil,
	}
}

func (p *Provider) CompleteStream(ctx context.Context, req domain.LLMRequest) domain.LLMResponseStream {
	outChan := make(chan string)
	errChan := make(chan error, 1)

	go func() {
		defer close(outChan)
		defer close(errChan)

		select {
		case <-time.After(p.latency):
		case <-ctx.Done():
			errChan <- ctx.Err()
			return
		}

		output := fmt.Sprintf("[mock] model=%s | %s", req.Model, req.UserPrompt)

		words := strings.Split(output, " ")

		for i, word := range words {
			select {
			case outChan <- word + " ":
			case <-ctx.Done():
				errChan <- ctx.Err()
				return
			}

			if i < len(words)-1 {
				select {
				case <-time.After(p.latency / 10):
				case <-ctx.Done():
					errChan <- ctx.Err()
					return
				}
			}
		}
	}()

	return domain.LLMResponseStream{
		OutputChan: outChan,
		ErrorChan:  errChan,
	}
}
