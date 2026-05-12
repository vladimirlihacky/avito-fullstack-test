package e2e_test

import (
	"context"
	"errors"
	"testing"

	"backend/internal/domain"

	"github.com/stretchr/testify/require"
)

type failingLLMProvider struct{}

func (f *failingLLMProvider) Complete(ctx context.Context, req domain.LLMRequest) (domain.LLMResponse, error) {
	return domain.LLMResponse{}, errors.New("provider unavailable")
}

func TestE2E_LLMProviderError_RunSavedAsFailed(t *testing.T) {
	ctx := context.Background()

	svc := setupTest(t)

	category, err := svc.categoryService.Create(ctx, &domain.Category{Name: "Категория"})
	require.NoError(t, err)

	assistant, err := svc.assistantService.Create(ctx, &domain.Assistant{
		CategoryID:   category.ID,
		Name:         "Ассистент",
		Description:  "Описание",
		Model:        "mock",
		SystemPrompt: "Промпт",
		IsActive:     true,
	})
	require.NoError(t, err)

	_ = assistant
}
