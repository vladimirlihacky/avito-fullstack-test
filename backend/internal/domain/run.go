package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type RunStatus string

func (r RunStatus) IsValid() bool {
	switch r {
	case RunStatusFailed, RunStatusPending, RunStatusSuccess:
		return true
	}
	return false
}

func (r *RunStatus) UnmarshalJSON(data []byte) error {
	type alias RunStatus
	var s alias

	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	if !RunStatus(s).IsValid() {
		return ErrInvalidRole
	}

	*r = RunStatus(s)
	return nil
}

const (
	RunStatusPending RunStatus = "pending"
	RunStatusSuccess RunStatus = "success"
	RunStatusFailed  RunStatus = "failed"
)

type Run struct {
	ID            uuid.UUID
	AssistantID   uuid.UUID
	AssistantName string
	CategoryID    uuid.UUID
	CategoryName  string
	UserID        uuid.UUID
	Model         string
	UserPrompt    string
	Output        *string
	Status        RunStatus
	Error         *string
	CreatedAt     time.Time
}

type RunFilter struct {
	Pagination
	UserID      *uuid.UUID
	AssistantID *uuid.UUID
	Status      *RunStatus
}
