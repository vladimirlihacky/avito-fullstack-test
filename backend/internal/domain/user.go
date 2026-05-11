package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Role string

func (r Role) IsValid() bool {
	switch r {
	case RoleAdmin, RoleUser:
		return true
	}
	return false
}

func (r *Role) UnmarshalJSON(data []byte) error {
	type alias Role
	var s alias

	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	if !Role(s).IsValid() {
		return ErrInvalidRole
	}

	*r = Role(s)
	return nil
}

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
)

type User struct {
	ID        uuid.UUID
	Email     string
	Role      Role
	CreatedAt time.Time
}
