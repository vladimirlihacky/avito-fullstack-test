package service

import (
	"backend/internal/domain"
	"context"

	"github.com/google/uuid"
)

type assistantRepo interface {
	List(ctx context.Context, f domain.AssistantFilter) ([]*domain.Assistant, int, error)
	Create(ctx context.Context, assistant *domain.Assistant) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Assistant, error)
	Update(ctx context.Context, assistant *domain.Assistant) error
}

type assistantCategoryRepo interface {
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error)
}

type AssistantService struct {
	assistantRepo assistantRepo
	categoryRepo  assistantCategoryRepo
}

func NewAssistantService(assistantRepo assistantRepo, categoryRepo assistantCategoryRepo) *AssistantService {
	return &AssistantService{
		assistantRepo: assistantRepo,
		categoryRepo:  categoryRepo,
	}
}

func (s *AssistantService) GetAll(ctx context.Context, f domain.AssistantFilter) ([]*domain.Assistant, int, error) {
	return s.assistantRepo.List(ctx, f)
}

func (s *AssistantService) Create(ctx context.Context, assistant *domain.Assistant) (*domain.Assistant, error) {
	if assistant.SystemPrompt == "" {
		return nil, domain.ErrInvalidRequest
	}
	if _, err := s.categoryRepo.GetByID(ctx, assistant.CategoryID); err != nil {
		return nil, domain.ErrCategoryNotFound
	}

	if err := s.assistantRepo.Create(ctx, assistant); err != nil {
		return nil, err
	}

	return assistant, nil
}

func (s *AssistantService) GetByID(ctx context.Context, id uuid.UUID) (*domain.Assistant, error) {
	return s.assistantRepo.GetByID(ctx, id)
}

func (s *AssistantService) Update(ctx context.Context, assistant *domain.Assistant) (*domain.Assistant, error) {
	if assistant.SystemPrompt == "" {
		return nil, domain.ErrInvalidRequest
	}
	if _, err := s.categoryRepo.GetByID(ctx, assistant.CategoryID); err != nil {
		return nil, domain.ErrCategoryNotFound
	}
	if err := s.assistantRepo.Update(ctx, assistant); err != nil {
		return nil, err
	}

	return assistant, nil
}
