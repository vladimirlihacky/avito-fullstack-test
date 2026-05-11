package domain

import "errors"

var (
	ErrInvalidRequest    = errors.New("invalid request")
	ErrNotFound          = errors.New("entity not found")
	ErrUserExists        = errors.New("user already exists")
	ErrAssistantInactive = errors.New("assistant is inactive")
	ErrLLMProvider       = errors.New("LLM provider error")
	ErrInvalidRole       = errors.New("invalid role")
)
