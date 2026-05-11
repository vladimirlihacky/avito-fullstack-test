package dto

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

type DummyLoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID        string `json:"id"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		CreatedAt string `json:"createdAt"`
	} `json:"user"`
}

type RegisterResponse struct {
	Token string `json:"token"`
	User  struct {
		ID        string `json:"id"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		CreatedAt string `json:"createdAt"`
	} `json:"user"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID        string `json:"id"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		CreatedAt string `json:"createdAt"`
	} `json:"user"`
}
