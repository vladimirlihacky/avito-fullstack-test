package handler

import (
	"backend/internal/provider"
	"net/http"
)

type providerLister interface {
	List() []provider.ProviderInfo
}

func (h *Handler) ListProviders(w http.ResponseWriter, r *http.Request) {
	providers := h.providerService.List()
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"providers": providers,
	})
}
