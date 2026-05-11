package dto

type RequestPagination struct {
	Page     int `json:"page" validate:"gte=1"`
	PageSize int `json:"page_size" validate:"gte=1"`
}

type ResponsePagination struct {
	Page     int `json:"page"`
	PageSize int `json:"page_size"`
	Total    int `json:"total"`
}
