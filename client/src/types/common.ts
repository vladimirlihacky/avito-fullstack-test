export interface RequestPagination {
    page: number, 
    pageSize: number, 
}

export interface ResponsePagination {
    page: number, 
    pageSize: number, 
    total: number,
}

export interface ErrorResponse {
    error: {
        code: string, 
        message: string,
    }
}

