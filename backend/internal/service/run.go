package service

import (
	"backend/internal/domain"
	"backend/internal/metrics"
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type runRepo interface {
	List(ctx context.Context, f domain.RunFilter) ([]*domain.Run, int, error)
	Create(ctx context.Context, run *domain.Run) error
	Update(ctx context.Context, run *domain.Run) error
}

type RunService struct {
	runRepo       runRepo
	assistantRepo assistantRepo
	llmProvider   domain.LLMProvider
}

func NewRunService(runRepo runRepo, assistantRepo assistantRepo, llmProvider domain.LLMProvider) *RunService {
	return &RunService{
		runRepo:       runRepo,
		assistantRepo: assistantRepo,
		llmProvider:   llmProvider,
	}
}

func (s *RunService) Create(ctx context.Context, assistantID uuid.UUID, userID uuid.UUID, userPrompt string) (*domain.Run, error) {
	metrics.RunAttempts.WithLabelValues(assistantID.String()).Inc()
	metrics.ActiveRuns.Inc()
	defer metrics.ActiveRuns.Dec()
	startTime := time.Now()

	assistant, err := s.assistantRepo.GetByID(ctx, assistantID)
	if err != nil {
		return nil, err
	}

	if !assistant.IsActive {
		return nil, domain.ErrAssistantInactive
	}

	run := &domain.Run{
		AssistantID: assistantID,
		UserID:      userID,
		Model:       assistant.Model,
		UserPrompt:  userPrompt,
		Status:      domain.RunStatusPending,
	}

	if err := s.runRepo.Create(ctx, run); err != nil {
		return nil, err
	}

	llmCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	resp, err := s.llmProvider.Complete(llmCtx, domain.LLMRequest{
		Model:        assistant.Model,
		SystemPrompt: assistant.SystemPrompt,
		UserPrompt:   userPrompt,
	})
	if err != nil {
		metrics.RunDuration.WithLabelValues("failed").Observe(time.Since(startTime).Seconds())

		errMsg := err.Error()
		run.Status = domain.RunStatusFailed
		run.Error = &errMsg
		if updateErr := s.runRepo.Update(ctx, run); updateErr != nil {
			fmt.Printf("LLM run update status fail: %v", updateErr)
		}
		return run, domain.ErrLLMProvider
	}

	run.Status = domain.RunStatusSuccess
	run.Output = &resp.Output

	if err := s.runRepo.Update(ctx, run); err != nil {
		return nil, err
	}

	metrics.RunDuration.WithLabelValues("success").Observe(time.Since(startTime).Seconds())

	return run, nil
}

func (s *RunService) List(ctx context.Context, f domain.RunFilter) ([]*domain.Run, int, error) {
	return s.runRepo.List(ctx, f)
}
