package service_test

import (
	"backend/internal/auth"
	"backend/internal/domain"
	"backend/internal/service"
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestAuthService_DummyLogin(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"

	authService := service.NewAuthService(mockUserRepo, mockSecret)

	token, err := authService.DummyLogin("admin")

	expected, _ := auth.GetDummyUser("admin")

	assert.NoError(t, err)
	assert.Equal(t, token.User.ID, expected.ID)
}

func TestAuthService_Login(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"
	authService := service.NewAuthService(mockUserRepo, mockSecret)

	ctx := context.Background()
	email := "user@test.com"
	password := "password123"

	user := &domain.User{
		ID:    getMockUUID(),
		Email: email,
		Role:  domain.RoleUser,
	}

	passwordHash, _ := auth.HashPassword(password)

	mockUserRepo.On("FindByEmail", ctx, email).Return(user, passwordHash, nil)

	token, err := authService.Login(ctx, email, password)

	assert.NoError(t, err)
	assert.NotNil(t, token)
	assert.Equal(t, user.ID, token.User.ID)
	assert.Equal(t, email, token.User.Email)

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Login_InvalidPassword(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"
	authService := service.NewAuthService(mockUserRepo, mockSecret)

	ctx := context.Background()
	email := "user@test.com"
	password := "wrongpassword"

	user := &domain.User{
		ID:    getMockUUID(),
		Email: email,
		Role:  domain.RoleUser,
	}

	correctPassword := "password123"
	passwordHash, _ := auth.HashPassword(correctPassword)

	mockUserRepo.On("FindByEmail", ctx, email).Return(user, passwordHash, nil)

	token, err := authService.Login(ctx, email, password)

	assert.ErrorIs(t, err, domain.ErrInvalidCredentials)
	assert.Nil(t, token)

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Login_UserNotFound(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"
	authService := service.NewAuthService(mockUserRepo, mockSecret)

	ctx := context.Background()
	email := "nonexistent@test.com"
	password := "password123"

	mockUserRepo.On("FindByEmail", ctx, email).Return(nil, "", domain.ErrNotFound)

	token, err := authService.Login(ctx, email, password)

	assert.ErrorIs(t, err, domain.ErrNotFound)
	assert.Nil(t, token)

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Register(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"
	authService := service.NewAuthService(mockUserRepo, mockSecret)

	ctx := context.Background()
	email := "newuser@test.com"
	password := "password123"

	mockUserRepo.On("FindByEmail", ctx, email).Return(nil, "", domain.ErrNotFound)
	mockUserRepo.On("Create", ctx, mock.MatchedBy(func(u *domain.User) bool {
		return u.Email == email && u.Role == domain.RoleUser
	}), mock.Anything).Return(nil)

	token, err := authService.Register(ctx, email, password)

	assert.NoError(t, err)
	assert.NotNil(t, token)
	assert.Equal(t, email, token.User.Email)
	assert.Equal(t, domain.RoleUser, token.User.Role)

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Register_UserAlreadyExists(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"
	authService := service.NewAuthService(mockUserRepo, mockSecret)

	ctx := context.Background()
	email := "existing@test.com"
	password := "password123"

	existingUser := &domain.User{
		ID:    getMockUUID(),
		Email: email,
		Role:  domain.RoleUser,
	}

	mockUserRepo.On("FindByEmail", ctx, email).Return(existingUser, "", nil)

	token, err := authService.Register(ctx, email, password)

	assert.ErrorIs(t, err, domain.ErrUserExists)
	assert.Nil(t, token)

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_Register_DatabaseError(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"
	authService := service.NewAuthService(mockUserRepo, mockSecret)

	ctx := context.Background()
	email := "newuser@test.com"
	password := "password123"

	mockUserRepo.On("FindByEmail", ctx, email).Return(nil, "", domain.ErrNotFound)
	mockUserRepo.On("Create", ctx, mock.MatchedBy(func(u *domain.User) bool {
		return u.Email == email
	}), mock.Anything).Return(domain.ErrInvalidRequest)

	token, err := authService.Register(ctx, email, password)

	assert.ErrorIs(t, err, domain.ErrInternal)
	assert.Nil(t, token)

	mockUserRepo.AssertExpectations(t)
}

func TestAuthService_DummyLogin_InvalidRole(t *testing.T) {
	mockUserRepo := new(MockUserRepo)
	mockSecret := "secret"
	authService := service.NewAuthService(mockUserRepo, mockSecret)

	token, err := authService.DummyLogin(domain.Role("invalid"))

	assert.ErrorIs(t, err, domain.ErrInvalidRequest)
	assert.Nil(t, token)
}
