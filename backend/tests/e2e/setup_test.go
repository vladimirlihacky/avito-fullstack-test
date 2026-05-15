package e2e_test

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	"backend/internal/llm/mock"
	"backend/internal/repo/postgres"
	"backend/internal/service"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/require"
)

type testServices struct {
	categoryService  *service.CategoryService
	assistantService *service.AssistantService
	runService       *service.RunService
	authService      *service.AuthService
}

var testDB *pgxpool.Pool

func TestMain(m *testing.M) {
	ctx := context.Background()

	connStr := os.Getenv("TEST_DATABASE_URL")
	if connStr == "" {
		panic("TEST_DATABASE_URL is not set")
	}

	runMigrations(connStr)

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		panic(err)
	}

	testDB = pool

	code := m.Run()

	pool.Close()

	os.Exit(code)
}

func setupTest(t *testing.T) *testServices {
	t.Helper()

	ctx := context.Background()

	cleanupDB(t, ctx, testDB)
	seedTestData(t, ctx, testDB)

	return buildServices(testDB)
}

func buildServices(pool *pgxpool.Pool) *testServices {
	userRepo := postgres.NewUserRepo(pool)
	categoryRepo := postgres.NewCategoryRepo(pool)
	assistantRepo := postgres.NewAssistantRepo(pool)
	runRepo := postgres.NewRunRepo(pool)

	llmProvider := mock.NewProvider(300 * time.Millisecond)

	return &testServices{
		categoryService: service.NewCategoryService(categoryRepo),
		assistantService: service.NewAssistantService(
			assistantRepo,
			categoryRepo,
		),
		runService: service.NewRunService(
			runRepo,
			assistantRepo,
			llmProvider,
		),
		authService: service.NewAuthService(
			userRepo,
			"test-secret",
		),
	}
}

func cleanupDB(
	t *testing.T,
	ctx context.Context,
	pool *pgxpool.Pool,
) {
	t.Helper()

	_, err := pool.Exec(ctx, `
		TRUNCATE TABLE
			runs,
			assistants,
			categories,
			users
		RESTART IDENTITY CASCADE;
	`)

	require.NoError(t, err)
}

func seedTestData(
	t *testing.T,
	ctx context.Context,
	pool *pgxpool.Pool,
) {
	t.Helper()

	_, err := pool.Exec(ctx, `
		INSERT INTO users (
			id,
			email,
			role,
			password_hash
		)
		VALUES
			(
				'00000000-0000-0000-0000-000000000001',
				'admin@example.com',
				'admin',
				'dummy'
			),
			(
				'00000000-0000-0000-0000-000000000002',
				'user@example.com',
				'user',
				'dummy'
			);
	`)

	require.NoError(t, err)
}

func runMigrations(connStr string) {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		panic("cannot get runtime caller")
	}

	migrationsPath := filepath.Join(
		filepath.Dir(filename),
		"../../migrations",
	)

	m, err := migrate.New(
		"file://"+migrationsPath,
		connStr,
	)
	if err != nil {
		panic(err)
	}

	defer func() {
		srcErr, dbErr := m.Close()

		if srcErr != nil {
			panic(srcErr)
		}

		if dbErr != nil {
			panic(dbErr)
		}
	}()

	version, dirty, err := m.Version()

	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		panic(err)
	}

	if dirty {
		if err := m.Force(int(version)); err != nil {
			panic(err)
		}
	}

	if err := m.Up(); err != nil &&
		!errors.Is(err, migrate.ErrNoChange) {
		panic(err)
	}
}
