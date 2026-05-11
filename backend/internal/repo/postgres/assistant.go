package postgres

import (
	"backend/internal/domain"
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AssistantRepo struct {
	pool *pgxpool.Pool
}

func NewAssistantRepo(pool *pgxpool.Pool) *AssistantRepo {
	return &AssistantRepo{pool: pool}
}

const assistantSelectBase = `
	SELECT a.id, a.category_id, c.name as category_name, a.name, a.description, 
	       a.model, a.system_prompt, a.example_user_prompt, 
	       a.is_active, a.created_at, a.updated_at
	FROM assistants a
	JOIN categories c ON a.category_id = c.id
`

func (r *AssistantRepo) Create(ctx context.Context, a *domain.Assistant) error {
	query := `
		INSERT INTO assistants (category_id, name, description, model, system_prompt, example_user_prompt, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		a.CategoryID, a.Name, a.Description, a.Model,
		a.SystemPrompt, a.ExampleUserPrompt, a.IsActive,
	).Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
}

func (r *AssistantRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Assistant, error) {
	query := assistantSelectBase + ` WHERE a.id = $1`
	return r.scanAssistant(r.pool.QueryRow(ctx, query, id))
}

func (r *AssistantRepo) Update(ctx context.Context, a *domain.Assistant) error {
	query := `
		UPDATE assistants 
		SET category_id=$1, name=$2, description=$3, model=$4, 
		    system_prompt=$5, example_user_prompt=$6, is_active=$7, updated_at=NOW()
		WHERE id=$8
		RETURNING updated_at
	`
	err := r.pool.QueryRow(ctx, query,
		a.CategoryID, a.Name, a.Description, a.Model,
		a.SystemPrompt, a.ExampleUserPrompt, a.IsActive, a.ID,
	).Scan(&a.UpdatedAt)

	if err != nil {
		return err
	}

	return nil
}

func (r *AssistantRepo) List(ctx context.Context, f domain.AssistantFilter) ([]*domain.Assistant, int, error) {
	where := []string{"1=1"}
	var args []any
	i := 1

	if !f.IncludeInactive {
		where = append(where, fmt.Sprintf("a.is_active = $%d", i))
		args = append(args, true)
		i++
	}
	if f.CategoryID != nil {
		where = append(where, fmt.Sprintf("a.category_id = $%d", i))
		args = append(args, *f.CategoryID)
		i++
	}
	if f.Search != "" {
		where = append(where, fmt.Sprintf(
			"to_tsvector('russian', a.name || ' ' || a.description) @@ websearch_to_tsquery('russian', $%d)", i,
		))
		args = append(args, f.Search)
		i++
	}

	whereClause := strings.Join(where, " AND ")

	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM assistants a JOIN categories c ON a.category_id = c.id WHERE %s`, whereClause)
	var total int
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return []*domain.Assistant{}, 0, nil
	}

	args = append(args, f.PageSize, (f.Page-1)*f.PageSize)
	dataQuery := fmt.Sprintf(`%s WHERE %s ORDER BY a.created_at DESC LIMIT $%d OFFSET $%d`,
		assistantSelectBase, whereClause, i, i+1,
	)

	rows, err := r.pool.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var assistants []*domain.Assistant
	for rows.Next() {
		a, err := r.scanAssistant(rows)
		if err != nil {
			return nil, 0, err
		}
		assistants = append(assistants, a)
	}

	return assistants, total, rows.Err()
}

func (r *AssistantRepo) scanAssistant(row pgx.Row) (*domain.Assistant, error) {
	a := &domain.Assistant{}
	err := row.Scan(
		&a.ID, &a.CategoryID, &a.CategoryName, &a.Name, &a.Description,
		&a.Model, &a.SystemPrompt, &a.ExampleUserPrompt,
		&a.IsActive, &a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return a, nil
}
