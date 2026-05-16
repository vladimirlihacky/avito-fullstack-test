package domain

import "errors"

var (
	ErrInvalidRequest     = errors.New("INVALID_REQUEST")
	ErrInvalidCredentials = errors.New("INVALID_CREDENTIALS")
	ErrNotFound           = errors.New("NOT_FOUND")
	ErrUserExists         = errors.New("USER_ALREADY_EXISTS")
	ErrAssistantInactive  = errors.New("ASSISTANT_INACTIVE")
	ErrLLMProvider        = errors.New("LLM PROVIDER_ERROR")
	ErrInvalidRole        = errors.New("INVALID_ROLE")
	ErrInternal           = errors.New("INTERNAL_ERROR")
)
