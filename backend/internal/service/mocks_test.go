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

func (m *MockLLMProvider) Complete(ctx context.Context, req domain.LLMRequest) domain.LLMResponse {
	args := m.Called(ctx, req)

	if resp, ok := args.Get(0).(domain.LLMResponse); ok {
		return resp
	}

	var output string
	if args.Get(0) != nil {
		output = args.Get(0).(string)
	}

	return domain.LLMResponse{
		Output: output,
		Error:  args.Error(1),
	}
}

func (m *MockLLMProvider) CompleteStream(ctx context.Context, req domain.LLMRequest) domain.LLMResponseStream {
	args := m.Called(ctx, req)

	if resp, ok := args.Get(0).(domain.LLMResponseStream); ok {
		return resp
	}

	outChan, _ := args.Get(0).(chan string)
	errChan := make(chan error, 1)
	errChan <- args.Error(1)
	return domain.LLMResponseStream{
		OutputChan: outChan,
		ErrorChan:  errChan,
	}
}

func ptrStr(s string) *string {
	return &s
}

func getMockUUID() uuid.UUID {
	return uuid.New()
}

type MockProviderRegistry struct {
	mock.Mock
}

func (m *MockProviderRegistry) Get(name string) (domain.LLMProvider, error) {
	args := m.Called(name)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(domain.LLMProvider), args.Error(1)
}

func (m *MockProviderRegistry) Exists(name string) bool {
	args := m.Called(name)
	return args.Bool(0)
}


