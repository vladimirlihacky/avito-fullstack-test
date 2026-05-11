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

type RunRepo struct {
	pool *pgxpool.Pool
}

func NewRunRepo(pool *pgxpool.Pool) *RunRepo {
	return &RunRepo{pool: pool}
}

const runSelectBase = `
	SELECT r.id, r.assistant_id, a.name as assistant_name, 
	       a.category_id, c.name as category_name,
	       r.user_id, r.model, r.user_prompt, 
	       r.output, r.status, r.error, r.created_at
	FROM runs r
	JOIN assistants a ON r.assistant_id = a.id
	JOIN categories c ON a.category_id = c.id
`

func (r *RunRepo) Create(ctx context.Context, run *domain.Run) error {
	query := `
		INSERT INTO runs (assistant_id, user_id, model, user_prompt, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query,
		run.AssistantID, run.UserID, run.Model, run.UserPrompt, run.Status,
	).Scan(&run.ID, &run.CreatedAt)
}

func (r *RunRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Run, error) {
	query := runSelectBase + ` WHERE r.id = $1`
	return r.scanRun(r.pool.QueryRow(ctx, query, id))
}

func (r *RunRepo) Update(ctx context.Context, run *domain.Run) error {
	query := `UPDATE runs SET status=$1, output=$2, error=$3 WHERE id=$4`
	cmd, err := r.pool.Exec(ctx, query, run.Status, run.Output, run.Error, run.ID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *RunRepo) List(ctx context.Context, f domain.RunFilter) ([]*domain.Run, int, error) {
	where := []string{"1=1"}
	var args []any
	i := 1

	if f.UserID != nil {
		where = append(where, fmt.Sprintf("r.user_id = $%d", i))
		args = append(args, *f.UserID)
		i++
	}
	if f.AssistantID != nil {
		where = append(where, fmt.Sprintf("r.assistant_id = $%d", i))
		args = append(args, *f.AssistantID)
		i++
	}
	if f.Status != nil {
		where = append(where, fmt.Sprintf("r.status = $%d", i))
		args = append(args, *f.Status)
		i++
	}

	whereClause := strings.Join(where, " AND ")

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*) 
		FROM runs r 
		JOIN assistants a ON r.assistant_id = a.id 
		JOIN categories c ON a.category_id = c.id 
		WHERE %s
	`, whereClause)

	var total int
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return []*domain.Run{}, 0, nil
	}

	args = append(args, f.PageSize, (f.Page-1)*f.PageSize)
	dataQuery := fmt.Sprintf(`%s WHERE %s ORDER BY r.created_at DESC LIMIT $%d OFFSET $%d`,
		runSelectBase, whereClause, i, i+1,
	)

	rows, err := r.pool.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var runs []*domain.Run
	for rows.Next() {
		run, err := r.scanRun(rows)
		if err != nil {
			return nil, 0, err
		}
		runs = append(runs, run)
	}

	return runs, total, rows.Err()
}

func (r *RunRepo) scanRun(row pgx.Row) (*domain.Run, error) {
	run := &domain.Run{}
	err := row.Scan(
		&run.ID, &run.AssistantID, &run.AssistantName,
		&run.CategoryID, &run.CategoryName,
		&run.UserID, &run.Model, &run.UserPrompt,
		&run.Output, &run.Status, &run.Error, &run.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return run, nil
}
