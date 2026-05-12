package service_test

import (
	"backend/internal/domain"
	"context"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
)

type MockUserRepo struct {
	mock.Mock
}

func (m *MockUserRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *MockUserRepo) FindByEmail(ctx context.Context, email string) (*domain.User, string, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Get(1).(string), args.Error(2)
	}
	return args.Get(0).(*domain.User), args.Get(1).(string), args.Error(2)
}

func (m *MockUserRepo) Create(ctx context.Context, user *domain.User, passwordHash string) error {
	args := m.Called(ctx, user, passwordHash)
	return args.Error(0)
}

type MockCategoryRepo struct {
	mock.Mock
}

func (m *MockCategoryRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error) {
	args := m.Called(ctx, id)

	var category *domain.Category
	if args.Get(0) != nil {
		category = args.Get(0).(*domain.Category)
	}

	return category, args.Error(1)
}

func (m *MockCategoryRepo) GetAll(ctx context.Context) ([]*domain.Category, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Category), args.Error(1)
}

func (m *MockCategoryRepo) Create(ctx context.Context, category *domain.Category) error {
	args := m.Called(ctx, category)
	return args.Error(0)
}

type MockAssistantRepo struct {
	mock.Mock
}

func (m *MockAssistantRepo) List(ctx context.Context, f domain.AssistantFilter) ([]*domain.Assistant, int, error) {
	args := m.Called(ctx, f)
	if args.Get(0) == nil {
		return nil, args.Int(1), args.Error(2)
	}
	return args.Get(0).([]*domain.Assistant), args.Int(1), args.Error(2)
}

func (m *MockAssistantRepo) Create(ctx context.Context, assistant *domain.Assistant) error {
	args := m.Called(ctx, assistant)
	return args.Error(0)
}

func (m *MockAssistantRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Assistant, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Assistant), args.Error(1)
}

func (m *MockAssistantRepo) Update(ctx context.Context, assistant *domain.Assistant) error {
	args := m.Called(ctx, assistant)
	return args.Error(0)
}

type MockRunRepo struct {
	mock.Mock
}

func (m *MockRunRepo) List(ctx context.Context, f domain.RunFilter) ([]*domain.Run, int, error) {
	args := m.Called(ctx, f)
	if args.Get(0) == nil {
		return nil, args.Int(1), args.Error(2)
	}
	return args.Get(0).([]*domain.Run), args.Int(1), args.Error(2)
}

func (m *MockRunRepo) Create(ctx context.Context, run *domain.Run) error {
	args := m.Called(ctx, run)
	return args.Error(0)
}

func (m *MockRunRepo) Update(ctx context.Context, run *domain.Run) error {
	args := m.Called(ctx, run)
	return args.Error(0)
}

type MockLLMProvider struct {
	mock.Mock
}

func (m *MockLLMProvider) Complete(ctx context.Context, req domain.LLMRequest) (domain.LLMResponse, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(domain.LLMResponse), args.Error(1)
}

func ptrStr(s string) *string {
	return &s
}

func getMockUUID() uuid.UUID {
	return uuid.New()
}
