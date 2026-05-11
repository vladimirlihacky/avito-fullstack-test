package dto

import "time"

type DummyLoginRequest struct {
	Role string `json:"role" validate:"required,oneof=admin user"`
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginResponseUserData struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

type LoginResponse struct {
	Token string                `json:"token"`
	User  LoginResponseUserData `json:"user"`
}
