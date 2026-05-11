package service

import (
	"backend/internal/domain"
	"context"
)

type categoryRepo interface {
	GetAll(ctx context.Context) ([]*domain.Category, error)
	Create(ctx context.Context, category *domain.Category) error
}

type CategoryService struct {
	categoryRepo categoryRepo
}

func NewCategoryService(categoryRepo categoryRepo) *CategoryService {
	return &CategoryService{categoryRepo: categoryRepo}
}

func (s *CategoryService) GetAll(ctx context.Context) ([]*domain.Category, error) {
	return s.categoryRepo.GetAll(ctx)
}

func (s *CategoryService) Create(ctx context.Context, category *domain.Category) (*domain.Category, error) {
	err := s.categoryRepo.Create(ctx, category)

	if err != nil {
		return nil, err
	}

	return category, nil
}
