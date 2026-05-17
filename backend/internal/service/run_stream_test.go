package service_test

import (
    "backend/internal/domain"
    "backend/internal/service"
    "context"
    "errors"
    "testing"
    "time"

    "github.com/google/uuid"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

func TestRunService_CreateStream_Success(t *testing.T) {
    mockRunRepo := new(MockRunRepo)
    mockAssistantRepo := new(MockAssistantRepo)
    mockLLMProvider := new(MockLLMProvider)

    runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

    ctx := context.Background()
    userID := uuid.New()
    assistantID := uuid.New()

    assistant := &domain.Assistant{
        ID:           assistantID,
        Model:        "gpt-4",
        SystemPrompt: "You are helpful",
        IsActive:     true,
    }

    mockAssistantRepo.On("GetByID", ctx, assistantID).Return(assistant, nil)
    mockRunRepo.On("Create", mock.Anything, mock.MatchedBy(func(r *domain.Run) bool {
        return r.UserID == userID && r.AssistantID == assistantID && r.Status == domain.RunStatusPending
    })).Return(nil)
    mockRunRepo.On("Update", mock.Anything, mock.Anything).Return(nil)

    out := make(chan string)
    errc := make(chan error)
    mockLLMProvider.On("CompleteStream", mock.Anything, mock.Anything).Return(domain.LLMResponseStream{OutputChan: out, ErrorChan: errc})

    run, resp, err := runService.CreateStream(ctx, assistantID, userID, "hi")
    assert.NoError(t, err)
    assert.NotNil(t, run)
    assert.NotNil(t, resp)

    // send chunks and close provider channels
    go func() {
        out <- "hello"
        out <- " world"
        close(out)
        close(errc)
    }()

    var received string
    timeout := time.After(2 * time.Second)
    for {
        select {
        case chunk, ok := <-resp.OutputChan:
            if !ok {
                goto Done
            }
            received += chunk
        case <-timeout:
            t.Fatal("timeout waiting for stream chunks")
        }
    }
Done:

    // allow goroutine to update run
    time.Sleep(50 * time.Millisecond)

    assert.Equal(t, "hello world", received)
    assert.Equal(t, domain.RunStatusSuccess, run.Status)
    if run.Output == nil {
        t.Fatalf("expected run output to be set")
    }
    assert.Equal(t, "hello world", *run.Output)

    mockAssistantRepo.AssertExpectations(t)
    mockRunRepo.AssertExpectations(t)
    mockLLMProvider.AssertExpectations(t)
}

func TestRunService_CreateStream_LLMProviderError(t *testing.T) {
    mockRunRepo := new(MockRunRepo)
    mockAssistantRepo := new(MockAssistantRepo)
    mockLLMProvider := new(MockLLMProvider)

    runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

    ctx := context.Background()
    userID := uuid.New()
    assistantID := uuid.New()

    assistant := &domain.Assistant{
        ID:           assistantID,
        Model:        "gpt-4",
        SystemPrompt: "S",
        IsActive:     true,
    }

    mockAssistantRepo.On("GetByID", ctx, assistantID).Return(assistant, nil)
    mockRunRepo.On("Create", mock.Anything, mock.Anything).Return(nil)
    mockRunRepo.On("Update", mock.Anything, mock.MatchedBy(func(r *domain.Run) bool {
        return r.Status == domain.RunStatusFailed && r.Error != nil
    })).Return(nil)

    out := make(chan string)
    errc := make(chan error)
    mockLLMProvider.On("CompleteStream", mock.Anything, mock.Anything).Return(domain.LLMResponseStream{OutputChan: out, ErrorChan: errc})

    run, resp, err := runService.CreateStream(ctx, assistantID, userID, "hi")
    assert.NoError(t, err)
    assert.NotNil(t, run)
    assert.NotNil(t, resp)

    go func() {
        errc <- errors.New("provider fail")
        close(out)
        close(errc)
    }()

    // drain error channel from service
    select {
    case e, ok := <-resp.ErrorChan:
        if ok {
            assert.Error(t, e)
        }
    case <-time.After(2 * time.Second):
        t.Fatal("timeout waiting for error")
    }

    // allow goroutine to update run
    time.Sleep(50 * time.Millisecond)

    assert.Equal(t, domain.RunStatusFailed, run.Status)
    assert.NotNil(t, run.Error)

    mockAssistantRepo.AssertExpectations(t)
    mockRunRepo.AssertExpectations(t)
    mockLLMProvider.AssertExpectations(t)
}

func TestRunService_CreateStream_AssistantInactiveOrNotFound(t *testing.T) {
    mockRunRepo := new(MockRunRepo)
    mockAssistantRepo := new(MockAssistantRepo)
    mockLLMProvider := new(MockLLMProvider)

    runService := service.NewRunService(mockRunRepo, mockAssistantRepo, mockLLMProvider)

    ctx := context.Background()
    userID := uuid.New()
    assistantID := uuid.New()

    // not found
    mockAssistantRepo.On("GetByID", ctx, assistantID).Return(nil, domain.ErrNotFound)
    r, resp, err := runService.CreateStream(ctx, assistantID, userID, "p")
    assert.ErrorIs(t, err, domain.ErrNotFound)
    assert.Nil(t, r)
    assert.Nil(t, resp)

    // inactive
    assistant := &domain.Assistant{ID: assistantID, IsActive: false}
    mockAssistantRepo.ExpectedCalls = nil
    mockAssistantRepo.On("GetByID", ctx, assistantID).Return(assistant, nil)
    r2, resp2, err2 := runService.CreateStream(ctx, assistantID, userID, "p")
    assert.ErrorIs(t, err2, domain.ErrAssistantInactive)
    assert.Nil(t, r2)
    assert.Nil(t, resp2)

    mockAssistantRepo.AssertExpectations(t)
}
