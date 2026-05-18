package provider

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type ProviderConfig struct {
	Name      string   `yaml:"name"`
	Type      string   `yaml:"type"`
	BaseURL   string   `yaml:"base_url"`
	APIKeyEnv string   `yaml:"api_key_env"`
	Models    []string `yaml:"models"`
}

type ProvidersConfig struct {
	Providers []ProviderConfig `yaml:"providers"`
}

func LoadConfig(path string) (*ProvidersConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read providers config: %w", err)
	}

	var cfg ProvidersConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("parse providers config: %w", err)
	}

	if len(cfg.Providers) == 0 {
		return nil, fmt.Errorf("providers config: at least one provider is required")
	}

	names := make(map[string]bool)
	for i := range cfg.Providers {
		p := &cfg.Providers[i]
		if p.Name == "" {
			return nil, fmt.Errorf("providers config: provider at index %d has empty name", i)
		}
		if names[p.Name] {
			return nil, fmt.Errorf("providers config: duplicate provider name %q", p.Name)
		}
		names[p.Name] = true
		if p.Type == "" {
			return nil, fmt.Errorf("providers config: provider %q has empty type", p.Name)
		}
	}

	return &cfg, nil
}
