package service_test

import (
	"backend/internal/domain"
	"backend/internal/service"
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestAssistantService_GetByID(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	service := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()
	targetID := uuid.New()
	expectedAssistant := &domain.Assistant{ID: targetID, Name: "AI Helper"}

	mockAssistantRepo.On("GetByID", ctx, targetID).Return(expectedAssistant, nil)

	result, err := service.GetByID(ctx, targetID)

	assert.NoError(t, err)
	assert.Equal(t, expectedAssistant, result)

	mockAssistantRepo.AssertExpectations(t)
}

func TestAssistantService_GetAll(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	service := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()
	expectedAssistants := []*domain.Assistant{
		{ID: uuid.New(), Name: "A"},
		{ID: uuid.New(), Name: "B"},
		{ID: uuid.New(), Name: "C"},
	}

	assistantFilter := domain.AssistantFilter{}

	mockAssistantRepo.On("List", ctx, assistantFilter).Return(expectedAssistants, len(expectedAssistants), nil)

	result, total, err := service.GetAll(ctx, assistantFilter)

	assert.NoError(t, err)
	assert.Equal(t, len(expectedAssistants), total)
	assert.Equal(t, expectedAssistants, result)

	mockAssistantRepo.AssertExpectations(t)
}
func TestAssistantService_GetAll_FilterByCategory(t *testing.T) {
        mockAssistantRepo := new(MockAssistantRepo)
        mockCategoryRepo := new(MockCategoryRepo)

        assistantService := service.NewAssistantService(
                mockAssistantRepo,
                mockCategoryRepo,
        )

        ctx := context.Background()
        categoryID := uuid.New()
        filter := domain.AssistantFilter{
                CategoryID: &categoryID,
        }

        expected := []*domain.Assistant{
                {ID: uuid.New(), CategoryID: categoryID},
        }

        mockAssistantRepo.On("List", ctx, filter).Return(expected, 1, nil)

        result, total, err := assistantService.GetAll(ctx, filter)

        assert.NoError(t, err)
        assert.Equal(t, 1, total)
        assert.Len(t, result, 1)
        assert.Equal(t, categoryID, result[0].CategoryID)

        mockAssistantRepo.AssertExpectations(t)
}


func TestAssistantService_Create(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	service := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	categoryId := uuid.New()
	assistantData := &domain.Assistant{
		Name:         "A",
		CategoryID:   categoryId,
		SystemPrompt: "System prompt",
	}

	mockCategoryRepo.On("GetByID", ctx, categoryId).Return(nil, nil)
	mockAssistantRepo.On("Create", ctx, assistantData).Return(nil)

	result, err := service.Create(ctx, assistantData)

	assert.NoError(t, err)
	assert.Equal(t, assistantData, result)

	mockAssistantRepo.AssertExpectations(t)
}

func TestAssistantService_Create_WithoutSystemPrompt(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	service := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	assistantData := &domain.Assistant{
		Name: "A",
	}

	result, err := service.Create(ctx, assistantData)

	assert.ErrorIs(t, err, domain.ErrInvalidRequest)
	assert.Nil(t, result)
}

func TestAssistantService_Create_NonexistentCategory(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	service := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	id := uuid.New()
	mockCategoryRepo.On("GetByID", ctx, id).Return(nil, domain.ErrNotFound)

	assistantData := &domain.Assistant{
		Name:         "A",
		SystemPrompt: "System prompt",
		CategoryID:   id,
	}

	result, err := service.Create(ctx, assistantData)

	assert.ErrorIs(t, err, domain.ErrCategoryNotFound)
	assert.Nil(t, result)

	mockCategoryRepo.AssertExpectations(t)
}

func TestAssistantService_Update_Success(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	assistantService := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	categoryId := uuid.New()
	assistantData := &domain.Assistant{
		ID:           uuid.New(),
		Name:         "Updated AI",
		CategoryID:   categoryId,
		SystemPrompt: "Updated system prompt",
	}

	mockCategoryRepo.On("GetByID", ctx, categoryId).Return(&domain.Category{ID: categoryId}, nil)
	mockAssistantRepo.On("Update", ctx, assistantData).Return(nil)

	result, err := assistantService.Update(ctx, assistantData)

	assert.NoError(t, err)
	assert.Equal(t, assistantData, result)

	mockAssistantRepo.AssertExpectations(t)
	mockCategoryRepo.AssertExpectations(t)
}

func TestAssistantService_Update_WithoutSystemPrompt(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	assistantService := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	assistantData := &domain.Assistant{
		ID:           uuid.New(),
		Name:         "Updated AI",
		SystemPrompt: "",
	}

	result, err := assistantService.Update(ctx, assistantData)

	assert.ErrorIs(t, err, domain.ErrInvalidRequest)
	assert.Nil(t, result)
}

func TestAssistantService_Update_NonexistentCategory(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	assistantService := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	categoryId := uuid.New()
	assistantData := &domain.Assistant{
		ID:           uuid.New(),
		Name:         "Updated AI",
		CategoryID:   categoryId,
		SystemPrompt: "System prompt",
	}

	mockCategoryRepo.On("GetByID", ctx, categoryId).Return(nil, domain.ErrNotFound)

	result, err := assistantService.Update(ctx, assistantData)

	assert.ErrorIs(t, err, domain.ErrCategoryNotFound)
	assert.Nil(t, result)

	mockCategoryRepo.AssertExpectations(t)
}

func TestAssistantService_Update_DatabaseError(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	assistantService := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	categoryId := uuid.New()
	assistantData := &domain.Assistant{
		ID:           uuid.New(),
		Name:         "Updated AI",
		CategoryID:   categoryId,
		SystemPrompt: "System prompt",
	}

	mockCategoryRepo.On("GetByID", ctx, categoryId).Return(&domain.Category{ID: categoryId}, nil)
	mockAssistantRepo.On("Update", ctx, assistantData).Return(domain.ErrInvalidRequest)

	result, err := assistantService.Update(ctx, assistantData)

	assert.ErrorIs(t, err, domain.ErrInvalidRequest)
	assert.Nil(t, result)

	mockAssistantRepo.AssertExpectations(t)
	mockCategoryRepo.AssertExpectations(t)
}

func TestAssistantService_Create_DatabaseError(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	assistantService := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()

	categoryId := uuid.New()
	assistantData := &domain.Assistant{
		Name:         "A",
		SystemPrompt: "System prompt",
		CategoryID:   categoryId,
	}

	mockCategoryRepo.On("GetByID", ctx, categoryId).Return(&domain.Category{ID: categoryId}, nil)
	mockAssistantRepo.On("Create", ctx, assistantData).Return(domain.ErrInvalidRequest)

	result, err := assistantService.Create(ctx, assistantData)

	assert.ErrorIs(t, err, domain.ErrInvalidRequest)
	assert.Nil(t, result)

	mockAssistantRepo.AssertExpectations(t)
	mockCategoryRepo.AssertExpectations(t)
}

func TestAssistantService_GetByID_NotFound(t *testing.T) {
	mockAssistantRepo := new(MockAssistantRepo)
	mockCategoryRepo := new(MockCategoryRepo)

	assistantService := service.NewAssistantService(
		mockAssistantRepo,
		mockCategoryRepo,
	)

	ctx := context.Background()
	targetID := uuid.New()

	mockAssistantRepo.On("GetByID", ctx, targetID).Return(nil, domain.ErrNotFound)

	result, err := assistantService.GetByID(ctx, targetID)

	assert.ErrorIs(t, err, domain.ErrNotFound)
	assert.Nil(t, result)

	mockAssistantRepo.AssertExpectations(t)
}
