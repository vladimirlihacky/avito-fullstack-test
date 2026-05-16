package service_test

import (
	"backend/internal/domain"
	"backend/internal/service"
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestCategoryService_GetAll(t *testing.T) {
	mockCategoryRepo := new(MockCategoryRepo)
	categoryService := service.NewCategoryService(mockCategoryRepo)

	ctx := context.Background()
	expectedCategories := []*domain.Category{
		{ID: uuid.New(), Name: "Category 1", Description: ptrStr("Description 1")},
		{ID: uuid.New(), Name: "Category 2", Description: ptrStr("Description 2")},
	}

	mockCategoryRepo.On("GetAll", ctx).Return(expectedCategories, nil)

	result, err := categoryService.GetAll(ctx)

	assert.NoError(t, err)
	assert.Equal(t, len(expectedCategories), len(result))
	assert.Equal(t, expectedCategories, result)

	mockCategoryRepo.AssertExpectations(t)
}

func TestCategoryService_GetAll_Empty(t *testing.T) {
	mockCategoryRepo := new(MockCategoryRepo)
	categoryService := service.NewCategoryService(mockCategoryRepo)

	ctx := context.Background()

	mockCategoryRepo.On("GetAll", ctx).Return([]*domain.Category{}, nil)

	result, err := categoryService.GetAll(ctx)

	assert.NoError(t, err)
	assert.Equal(t, 0, len(result))

	mockCategoryRepo.AssertExpectations(t)
}

func TestCategoryService_GetAll_DatabaseError(t *testing.T) {
	mockCategoryRepo := new(MockCategoryRepo)
	categoryService := service.NewCategoryService(mockCategoryRepo)

	ctx := context.Background()

	mockCategoryRepo.On("GetAll", ctx).Return(nil, domain.ErrInvalidRequest)

	result, err := categoryService.GetAll(ctx)

	assert.ErrorIs(t, err, domain.ErrInternal)
	assert.Nil(t, result)

	mockCategoryRepo.AssertExpectations(t)
}

func TestCategoryService_Create(t *testing.T) {
	mockCategoryRepo := new(MockCategoryRepo)
	categoryService := service.NewCategoryService(mockCategoryRepo)

	ctx := context.Background()
	category := &domain.Category{
		Name:        "AI Tools",
		Description: ptrStr("Tools for AI assistants"),
	}

	mockCategoryRepo.On("Create", ctx, category).Return(nil)

	result, err := categoryService.Create(ctx, category)

	assert.NoError(t, err)
	assert.Equal(t, category, result)

	mockCategoryRepo.AssertExpectations(t)
}

func TestCategoryService_Create_DatabaseError(t *testing.T) {
	mockCategoryRepo := new(MockCategoryRepo)
	categoryService := service.NewCategoryService(mockCategoryRepo)

	ctx := context.Background()
	category := &domain.Category{
		Name:        "AI Tools",
		Description: ptrStr("Tools for AI assistants"),
	}

	mockCategoryRepo.On("Create", ctx, category).Return(domain.ErrInternal)

	result, err := categoryService.Create(ctx, category)

	assert.ErrorIs(t, err, domain.ErrInternal)
	assert.Nil(t, result)

	mockCategoryRepo.AssertExpectations(t)
}
