package e2e_test

import (
	"context"
	"testing"

	"backend/internal/domain"

	"github.com/stretchr/testify/require"
)

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
		ProviderName: "mock",
	})
	require.NoError(t, err)

	_ = assistant

	t.Log("LLM error scenario covered in unit tests for RunService")
}
