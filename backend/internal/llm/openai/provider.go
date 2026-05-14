package openai

import (
	"backend/internal/domain"
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
)

type Provider struct {
	baseURL string
	apiKey  string
	client  openai.Client
}

func NewProvider(baseURL, apiKey string) domain.LLMProvider {
	client := openai.NewClient(
		option.WithBaseURL(baseURL),
		option.WithAPIKey(apiKey),
	)

	return &Provider{
		client:  client,
		baseURL: baseURL,
		apiKey:  apiKey,
	}
}

func (p *Provider) Complete(ctx context.Context, req domain.LLMRequest) (domain.LLMResponse, error) {
	chatCompletion, err := p.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: req.Model,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(req.SystemPrompt),
			openai.UserMessage(req.UserPrompt),
		},
	})

	if err != nil {
		fmt.Printf("LLM PROVIDER ERROR %v", err)
		return domain.LLMResponse{}, err
	}

	llmResponse := domain.LLMResponse{
		Output: chatCompletion.Choices[0].Message.Content,
	}

	return llmResponse, nil
}
