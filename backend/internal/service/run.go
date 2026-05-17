package service

import (
	"backend/internal/domain"
	"backend/internal/metrics"
	"context"
	"fmt"
	"strings"
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
		return nil, domain.ErrNotFound
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
		return nil, domain.ErrInternal
	}

	llmCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	resp := s.llmProvider.Complete(llmCtx, domain.LLMRequest{
		Model:        assistant.Model,
		SystemPrompt: assistant.SystemPrompt,
		UserPrompt:   userPrompt,
	})

	if resp.Error != nil {
		metrics.RunDuration.WithLabelValues("failed").Observe(time.Since(startTime).Seconds())

		errMsg := domain.ErrLLMProvider.Error()

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
		return nil, domain.ErrInternal
	}

	metrics.RunDuration.WithLabelValues("success").Observe(time.Since(startTime).Seconds())

	return run, nil
}

// RunService метод
func (s *RunService) CreateStream(ctx context.Context, assistantID uuid.UUID, userID uuid.UUID, userPrompt string) (*domain.Run, *domain.LLMResponseStream, error) {
	assistant, err := s.assistantRepo.GetByID(ctx, assistantID)
	if err != nil {
		return nil, nil, domain.ErrNotFound
	}
	if !assistant.IsActive {
		return nil, nil, domain.ErrAssistantInactive
	}

	run := &domain.Run{
		AssistantID: assistantID,
		UserID:      userID,
		Model:       assistant.Model,
		UserPrompt:  userPrompt,
		Status:      domain.RunStatusPending,
	}
	if err := s.runRepo.Create(ctx, run); err != nil {
		return nil, nil, domain.ErrInternal
	}

	outputChan := make(chan string)
	errorChan := make(chan error, 1)

	go func() {
		defer close(outputChan)
		defer close(errorChan)

		llmCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		streamResp := s.llmProvider.CompleteStream(llmCtx, domain.LLMRequest{
			Model:        assistant.Model,
			SystemPrompt: assistant.SystemPrompt,
			UserPrompt:   userPrompt,
		})

		var fullOutput strings.Builder

		for {
			select {
			case chunk, ok := <-streamResp.OutputChan:
				if !ok {
					output := fullOutput.String()
					run.Output = &output
					run.Status = domain.RunStatusSuccess
					if err := s.runRepo.Update(context.Background(), run); err != nil {
						errorChan <- err
					}
					return
				}
				outputChan <- chunk
				fullOutput.WriteString(chunk)

			case err, ok := <-streamResp.ErrorChan:
				if ok && err != nil {
					run.Status = domain.RunStatusFailed
					errMsg := err.Error()
					run.Error = &errMsg
					updateError := s.runRepo.Update(context.Background(), run)
					errorChan <- err
					errorChan <- updateError
					return
				}

			case <-llmCtx.Done():
				run.Status = domain.RunStatusFailed
				errMsg := "timeout"
				run.Error = &errMsg
				updateError := s.runRepo.Update(context.Background(), run)
				errorChan <- llmCtx.Err()
				errorChan <- updateError
				return
			}
		}
	}()

	return run, &domain.LLMResponseStream{OutputChan: outputChan, ErrorChan: errorChan}, nil
}
func (s *RunService) List(ctx context.Context, f domain.RunFilter) ([]*domain.Run, int, error) {
	runs, total, err := s.runRepo.List(ctx, f)

	if err != nil {
		return nil, 0, domain.ErrInternal
	}

	return runs, total, nil
}
