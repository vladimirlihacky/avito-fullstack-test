package handler

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Code    string `json:"error"`
	Message string `json:"message"`
}

func respondError(w http.ResponseWriter, status int, code, message string) {
	respondJSON(w, status, map[string]ErrorResponse{
		"error": {
			Code:    code,
			Message: message,
		},
	})
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
