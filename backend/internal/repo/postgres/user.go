package postgres

import (
	"backend/internal/domain"
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
	pool *pgxpool.Pool
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{pool: pool}
}

func (r *UserRepo) Create(ctx context.Context, user *domain.User, passwordHash string) error {
	query := `
		INSERT INTO users (email, role, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, user.Email, user.Role, passwordHash).
		Scan(&user.ID, &user.CreatedAt)
}

func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `SELECT id, email, role, created_at FROM users WHERE id = $1`
	return r.scanUser(r.pool.QueryRow(ctx, query, id))
}

func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*domain.User, string, error) {
	query := `SELECT id, email, role, created_at, password_hash FROM users WHERE email = $1`

	u := &domain.User{}
	var hash string

	err := r.pool.QueryRow(ctx, query, email).Scan(&u.ID, &u.Email, &u.Role, &u.CreatedAt, &hash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, "", domain.ErrNotFound
		}
		return nil, "", err
	}
	return u, hash, nil
}

func (r *UserRepo) scanUser(row pgx.Row) (*domain.User, error) {
	u := &domain.User{}
	err := row.Scan(&u.ID, &u.Email, &u.Role, &u.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return u, nil
}
