package service

import (
	"backend/internal/auth"
	"backend/internal/domain"
	"context"
	"errors"

	"github.com/google/uuid"
)

type userRepo interface {
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, string, error)
	Create(ctx context.Context, user *domain.User, passwordHash string) error
}

type Token struct {
	Token string
	User  *domain.User
}

type AuthService struct {
	userRepo userRepo
	secret   string
}

func NewAuthService(userRepo userRepo, secret string) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		secret:   secret,
	}
}

func (s *AuthService) DummyLogin(role domain.Role) (*Token, error) {
	user, err := auth.GetDummyUser(role)
	if err != nil {
		return nil, domain.ErrInvalidRequest
	}

	token, err := auth.GenerateToken(user.ID, user.Role, s.secret)
	if err != nil {
		return nil, err
	}

	return &Token{Token: token, User: &user}, nil
}

func (s *AuthService) Register(ctx context.Context, email, password string) (*Token, error) {
	_, _, err := s.userRepo.FindByEmail(ctx, email)
	if err == nil {
		return nil, domain.ErrUserExists
	}
	if !errors.Is(err, domain.ErrNotFound) {
		return nil, err
	}
	user := &domain.User{
		Email: email,
		Role:  domain.RoleUser,
	}
	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}
	if err = s.userRepo.Create(ctx, user, passwordHash); err != nil {
		return nil, err
	}

	token, err := auth.GenerateToken(user.ID, user.Role, s.secret)
	if err != nil {
		return nil, err
	}
	return &Token{Token: token, User: user}, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*Token, error) {
	user, passwordHash, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if !auth.CheckPassword(password, passwordHash) {
		return nil, domain.ErrInvalidRequest
	}

	token, err := auth.GenerateToken(user.ID, user.Role, s.secret)

	return &Token{
		Token: token,
		User:  user,
	}, err
}
