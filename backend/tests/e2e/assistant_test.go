package e2e_test

import (
	"context"
	"testing"

	"backend/internal/domain"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestE2E_FullFlow(t *testing.T) {
	svc := setupTest(t)
	ctx := context.Background()

	category, err := svc.categoryService.Create(ctx, &domain.Category{
		Name:        "Тестовая категория",
		Description: ptrStr("Описание"),
	})
	require.NoError(t, err)
	require.NotEqual(t, uuid.Nil, category.ID)

	assistant, err := svc.assistantService.Create(ctx, &domain.Assistant{
		CategoryID:   category.ID,
		Name:         "Тестовый ассистент",
		Description:  "Описание",
		Model:        "mock",
		SystemPrompt: "Ты тестовый ассистент",
		IsActive:     true,
	})
	require.NoError(t, err)
	require.NotEqual(t, uuid.Nil, assistant.ID)
	assert.Equal(t, category.ID, assistant.CategoryID)

	userID := uuid.MustParse("00000000-0000-0000-0000-000000000002")
	run, err := svc.runService.Create(ctx, assistant.ID, userID, "привет")

	require.NoError(t, err)
	require.NotNil(t, run)
	assert.Equal(t, domain.RunStatusSuccess, run.Status)
	assert.NotNil(t, run.Output)
	assert.Equal(t, assistant.ID, run.AssistantID)
	assert.Equal(t, userID, run.UserID)
}

func TestE2E_FilterAssistantsByCategory(t *testing.T) {
	svc := setupTest(t)
	ctx := context.Background()

	cat1, err := svc.categoryService.Create(ctx, &domain.Category{Name: "Категория 1"})
	require.NoError(t, err)

	cat2, err := svc.categoryService.Create(ctx, &domain.Category{Name: "Категория 2"})
	require.NoError(t, err)

	_, err = svc.assistantService.Create(ctx, &domain.Assistant{
		CategoryID:   cat1.ID,
		Name:         "Ассистент 1",
		Description:  "Описание",
		Model:        "mock",
		SystemPrompt: "Промпт",
		IsActive:     true,
	})
	require.NoError(t, err)

	_, err = svc.assistantService.Create(ctx, &domain.Assistant{
		CategoryID:   cat1.ID,
		Name:         "Ассистент 2",
		Description:  "Описание",
		Model:        "mock",
		SystemPrompt: "Промпт",
		IsActive:     true,
	})
	require.NoError(t, err)

	_, err = svc.assistantService.Create(ctx, &domain.Assistant{
		CategoryID:   cat2.ID,
		Name:         "Ассистент 3",
		Description:  "Описание",
		Model:        "mock",
		SystemPrompt: "Промпт",
		IsActive:     true,
	})
	require.NoError(t, err)

	results, total, err := svc.assistantService.GetAll(ctx, domain.AssistantFilter{
		CategoryID: &cat1.ID,
		Pagination: domain.Pagination{Page: 1, PageSize: 10},
	})
	require.NoError(t, err)
	assert.Equal(t, 2, total)
	assert.Len(t, results, 2)

	for _, a := range results {
		assert.Equal(t, cat1.ID, a.CategoryID)
	}

	results, total, err = svc.assistantService.GetAll(ctx, domain.AssistantFilter{
		CategoryID: &cat2.ID,
		Pagination: domain.Pagination{Page: 1, PageSize: 10},
	})
	require.NoError(t, err)
	assert.Equal(t, 1, total)
	assert.Len(t, results, 1)
	assert.Equal(t, cat2.ID, results[0].CategoryID)
}

func TestE2E_RunInactiveAssistant(t *testing.T) {
	svc := setupTest(t)
	ctx := context.Background()

	category, err := svc.categoryService.Create(ctx, &domain.Category{
		Name: "Категория",
	})
	require.NoError(t, err)

	assistant, err := svc.assistantService.Create(ctx, &domain.Assistant{
		CategoryID:   category.ID,
		Name:         "Неактивный",
		Description:  "Описание",
		Model:        "mock",
		SystemPrompt: "Промпт",
		IsActive:     false,
	})
	require.NoError(t, err)

	userID := uuid.MustParse("00000000-0000-0000-0000-000000000002")
	run, err := svc.runService.Create(ctx, assistant.ID, userID, "привет")

	assert.ErrorIs(t, err, domain.ErrAssistantInactive)
	assert.Nil(t, run)
}

func ptrStr(s string) *string {
	return &s
}
