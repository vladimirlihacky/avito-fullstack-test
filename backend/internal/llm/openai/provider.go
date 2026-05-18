package openai

import (
	"backend/internal/domain"
	"context"

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

func (p *Provider) Complete(ctx context.Context, req domain.LLMRequest) domain.LLMResponse {
	chatCompletion, err := p.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: req.Model,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(req.SystemPrompt),
			openai.UserMessage(req.UserPrompt),
		},
	})

	if err != nil {
		return domain.LLMResponse{Error: err}
	}

	return domain.LLMResponse{
		Output: chatCompletion.Choices[0].Message.Content,
	}
}

func (p *Provider) CompleteStream(ctx context.Context, req domain.LLMRequest) domain.LLMResponseStream {
	outChan := make(chan string)
	errChan := make(chan error)

	llmResponseStream := domain.LLMResponseStream{
		OutputChan: outChan,
		ErrorChan:  errChan,
	}

	go func() {
		defer close(outChan)
		defer close(errChan)

		stream := p.client.Chat.Completions.NewStreaming(ctx, openai.ChatCompletionNewParams{
			Model: req.Model,
			Messages: []openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage(req.SystemPrompt),
				openai.UserMessage(req.UserPrompt),
			},
		})

		for stream.Next() {
			select {
			case <-ctx.Done():
				errChan <- ctx.Err()
				return
			default:
			}

			event := stream.Current()
			outChan <- event.Choices[0].Delta.Content
		}

		for stream.Err() != nil {
			errChan <- stream.Err()
			return
		}
	}()

	return llmResponseStream
}
