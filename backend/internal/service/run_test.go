package service_test

import (
	"backend/internal/domain"
	"backend/internal/service"
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestRunService_Create_Success(t *testing.T) {
	mockRunRepo := new(MockRunRepo)
	mockAssistantRepo := new(MockAssistantRepo)
	mockLLMProvider := new(MockLLMProvider)

	runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

	ctx := context.Background()
	userID := uuid.New()
	assistantID := uuid.New()
	userPrompt := "Tell me a joke"

	assistant := &domain.Assistant{
		ID:           assistantID,
		Name:         "Comedian",
		Model:        "gpt-4",
		SystemPrompt: "You are a comedian",
		IsActive:     true,
	}

	mockAssistantRepo.On("GetByID", ctx, assistantID).Return(assistant, nil)
	mockRunRepo.On("Create", ctx, mock.MatchedBy(func(r *domain.Run) bool {
		return r.UserID == userID && r.AssistantID == assistantID && r.Status == domain.RunStatusPending
	})).Return(nil)

	llmResponse := domain.LLMResponse{Output: "Why did the programmer quit his job? Because he didn't get arrays!", Error: nil}
	mockLLMProvider.On("Complete", mock.Anything, mock.Anything).Return(llmResponse)

	mockRunRepo.On("Update", mock.Anything, mock.Anything).Return(nil)

	result, err := runService.Create(ctx, assistantID, userID, userPrompt)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, domain.RunStatusSuccess, result.Status)
	assert.Equal(t, llmResponse.Output, *result.Output)

	mockAssistantRepo.AssertExpectations(t)
	mockRunRepo.AssertExpectations(t)
	mockLLMProvider.AssertExpectations(t)
}

func TestRunService_Create_AssistantInactive(t *testing.T) {
	mockRunRepo := new(MockRunRepo)
	mockAssistantRepo := new(MockAssistantRepo)
	mockLLMProvider := new(MockLLMProvider)

	runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

	ctx := context.Background()
	userID := uuid.New()
	assistantID := uuid.New()
	userPrompt := "Tell me a joke"

	assistant := &domain.Assistant{
		ID:           assistantID,
		Name:         "Comedian",
		Model:        "gpt-4",
		SystemPrompt: "You are a comedian",
		IsActive:     false,
	}

	mockAssistantRepo.On("GetByID", ctx, assistantID).Return(assistant, nil)

	result, err := runService.Create(ctx, assistantID, userID, userPrompt)

	assert.ErrorIs(t, err, domain.ErrAssistantInactive)
	assert.Nil(t, result)

	mockAssistantRepo.AssertExpectations(t)
}

func TestRunService_Create_AssistantNotFound(t *testing.T) {
	mockRunRepo := new(MockRunRepo)
	mockAssistantRepo := new(MockAssistantRepo)
	mockLLMProvider := new(MockLLMProvider)

	runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

	ctx := context.Background()
	userID := uuid.New()
	assistantID := uuid.New()
	userPrompt := "Tell me a joke"

	mockAssistantRepo.On("GetByID", ctx, assistantID).Return(nil, domain.ErrNotFound)

	result, err := runService.Create(ctx, assistantID, userID, userPrompt)

	assert.ErrorIs(t, err, domain.ErrNotFound)
	assert.Nil(t, result)

	mockAssistantRepo.AssertExpectations(t)
}

func TestRunService_Create_LLMProviderError(t *testing.T) {
	mockRunRepo := new(MockRunRepo)
	mockAssistantRepo := new(MockAssistantRepo)
	mockLLMProvider := new(MockLLMProvider)

	runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

	ctx := context.Background()
	userID := uuid.New()
	assistantID := uuid.New()
	userPrompt := "Tell me a joke"

	assistant := &domain.Assistant{
		ID:           assistantID,
		Name:         "Comedian",
		Model:        "gpt-4",
		SystemPrompt: "You are a comedian",
		IsActive:     true,
	}

	mockAssistantRepo.On("GetByID", ctx, assistantID).Return(assistant, nil)
	mockRunRepo.On("Create", ctx, mock.MatchedBy(func(r *domain.Run) bool {
		return r.Status == domain.RunStatusPending
	})).Return(nil)

	mockLLMProvider.On("Complete", mock.Anything, mock.Anything).Return(domain.LLMResponse{Error: domain.ErrLLMProvider})

	mockRunRepo.On("Update", ctx, mock.MatchedBy(func(r *domain.Run) bool {
		return r.Status == domain.RunStatusFailed && r.Error != nil
	})).Return(nil)

	result, err := runService.Create(ctx, assistantID, userID, userPrompt)

	assert.ErrorIs(t, err, domain.ErrLLMProvider)
	assert.NotNil(t, result)
	assert.Equal(t, domain.RunStatusFailed, result.Status)

	mockAssistantRepo.AssertExpectations(t)
	mockRunRepo.AssertExpectations(t)
	mockLLMProvider.AssertExpectations(t)
}

func TestRunService_List(t *testing.T) {
	mockRunRepo := new(MockRunRepo)
	mockAssistantRepo := new(MockAssistantRepo)
	mockLLMProvider := new(MockLLMProvider)

	runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

	ctx := context.Background()
	userID := uuid.New()
	filter := domain.RunFilter{
		UserID: &userID,
		Pagination: domain.Pagination{
			Page:     1,
			PageSize: 10,
		},
	}

	expectedRuns := []*domain.Run{
		{
			ID:         uuid.New(),
			UserID:     userID,
			Status:     domain.RunStatusSuccess,
			UserPrompt: "Tell me a joke",
		},
		{
			ID:         uuid.New(),
			UserID:     userID,
			Status:     domain.RunStatusPending,
			UserPrompt: "Tell me another joke",
		},
	}

	mockRunRepo.On("List", ctx, filter).Return(expectedRuns, len(expectedRuns), nil)

	result, total, err := runService.List(ctx, filter)

	assert.NoError(t, err)
	assert.Equal(t, len(expectedRuns), total)
	assert.Equal(t, expectedRuns, result)

	mockRunRepo.AssertExpectations(t)
}

func TestRunService_List_Empty(t *testing.T) {
	mockRunRepo := new(MockRunRepo)
	mockAssistantRepo := new(MockAssistantRepo)
	mockLLMProvider := new(MockLLMProvider)

	runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

	ctx := context.Background()
	filter := domain.RunFilter{
		Pagination: domain.Pagination{
			Page:     1,
			PageSize: 10,
		},
	}

	mockRunRepo.On("List", ctx, filter).Return([]*domain.Run{}, 0, nil)

	result, total, err := runService.List(ctx, filter)

	assert.NoError(t, err)
	assert.Equal(t, 0, total)
	assert.Equal(t, 0, len(result))

	mockRunRepo.AssertExpectations(t)
}
