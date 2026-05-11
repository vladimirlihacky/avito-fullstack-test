package postgres

import (
	"backend/internal/domain"
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryRepo struct {
	pool *pgxpool.Pool
}

func NewCategoryRepo(pool *pgxpool.Pool) *CategoryRepo {
	return &CategoryRepo{pool: pool}
}

func (r *CategoryRepo) Create(ctx context.Context, c *domain.Category) error {
	query := `
		INSERT INTO categories (name, description)
		VALUES ($1, $2)
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, c.Name, c.Description).
		Scan(&c.ID, &c.CreatedAt)
}

func (r *CategoryRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error) {
	query := `SELECT id, name, description, created_at FROM categories WHERE id = $1`
	return r.scanCategory(r.pool.QueryRow(ctx, query, id))
}

func (r *CategoryRepo) FindByName(ctx context.Context, name string) (*domain.Category, error) {
	query := `SELECT id, name, description, created_at FROM categories WHERE name = $1`
	return r.scanCategory(r.pool.QueryRow(ctx, query, name))
}

func (r *CategoryRepo) GetAll(ctx context.Context) ([]*domain.Category, error) {
	query := `SELECT id, name, description, created_at FROM categories ORDER BY name`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*domain.Category
	for rows.Next() {
		c, err := r.scanCategory(rows)
		if err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, rows.Err()
}

func (r *CategoryRepo) scanCategory(row pgx.Row) (*domain.Category, error) {
	c := &domain.Category{}
	err := row.Scan(&c.ID, &c.Name, &c.Description, &c.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return c, nil
}
