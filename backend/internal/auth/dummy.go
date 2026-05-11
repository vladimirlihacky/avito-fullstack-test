package auth

import (
	"backend/internal/domain"

	"github.com/google/uuid"
)

var (
	adminID = uuid.MustParse("00000000-0000-0000-0000-000000000001")
	userID  = uuid.MustParse("00000000-0000-0000-0000-000000000002")
)

var dummyUsers = map[domain.Role]domain.User{
	domain.RoleAdmin: {
		ID:    adminID,
		Email: "admin@example.com",
		Role:  domain.RoleAdmin,
	},
	domain.RoleUser: {
		ID:    userID,
		Email: "user@example.com",
		Role:  domain.RoleUser,
	},
}

func GetDummyUser(role domain.Role) (domain.User, error) {
	user, exists := dummyUsers[role]
	if !exists {
		return domain.User{}, domain.ErrInvalidRole
	}
	return user, nil
}
