package provider

import (
	"backend/internal/domain"
	"backend/internal/llm/mock"
	"backend/internal/llm/openai"
	"fmt"
	"log"
	"os"
	"time"
)

type ProviderInfo struct {
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	Models    []string `json:"models"`
	Available bool     `json:"available"`
}

type Registry struct {
	providers map[string]domain.LLMProvider
	infos     []ProviderInfo
}

func NewRegistry(cfg *ProvidersConfig) *Registry {
	r := &Registry{
		providers: make(map[string]domain.LLMProvider),
		infos:     make([]ProviderInfo, 0, len(cfg.Providers)),
	}

	for _, p := range cfg.Providers {
		info := ProviderInfo{
			Name:   p.Name,
			Type:   p.Type,
			Models: p.Models,
		}

		llmProvider, err := buildProvider(p)
		if err != nil {
			log.Printf("provider %q: unavailable — %v", p.Name, err)
			info.Available = false
		} else {
			info.Available = true
			r.providers[p.Name] = llmProvider
		}

		r.infos = append(r.infos, info)
	}

	return r
}

func buildProvider(cfg ProviderConfig) (domain.LLMProvider, error) {
	switch cfg.Type {
	case "mock":
		return mock.NewProvider(800 * time.Millisecond), nil

	case "openai":
		if cfg.BaseURL == "" {
			return nil, fmt.Errorf("base_url is required for openai provider")
		}
		if cfg.APIKeyEnv == "" {
			return nil, fmt.Errorf("api_key_env is required for openai provider")
		}
		apiKey := os.Getenv(cfg.APIKeyEnv)
		if apiKey == "" {
			return nil, fmt.Errorf("env var %s is not set or empty", cfg.APIKeyEnv)
		}
		return openai.NewProvider(cfg.BaseURL, apiKey), nil

	default:
		return nil, fmt.Errorf("unknown provider type %q", cfg.Type)
	}
}

func (r *Registry) Get(name string) (domain.LLMProvider, error) {
	p, ok := r.providers[name]
	if !ok {
		return nil, fmt.Errorf("provider %q not found or unavailable", name)
	}
	return p, nil
}

func (r *Registry) List() []ProviderInfo {
	return r.infos
}

func (r *Registry) Exists(name string) bool {
	for _, info := range r.infos {
		if info.Name == name {
			return true
		}
	}
	return false
}
