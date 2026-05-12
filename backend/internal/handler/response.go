package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
)

type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

func respondError(w http.ResponseWriter, status int, code, message string) {
	respondJSON(w, status, ErrorResponse{
		Error: ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}

func respondValidationError(w http.ResponseWriter, err error) {
	var invalidFields []string

	if ve, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range ve {
			invalidFields = append(invalidFields, fe.Field())
		}
	}

	response := ErrorResponse{
		Error: ErrorDetail{
			Code:    "INVALID_REQUEST",
			Message: "invalid fields: " + strings.Join(invalidFields, ", "),
		},
	}

	respondJSON(w, http.StatusBadRequest, response)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		return
	}
}
