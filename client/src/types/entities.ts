export enum UserRole {
    Admin = "admin",
    User = "user",
}

export interface AuthToken {
    token: string, 
    user: User,
}

export interface User {
    id: string, 
    email: string, 
    role: string,
    createdAt?: Date,
}

export interface Category {
    id: string,
    name: string, 
    description?: string, 
    createdAt?: Date, 
}

export interface Assistant {
    id: string, 
    categoryId: string, 
    name: string, 
    description: string,
    model: string, 
    isActive: boolean,
    categoryName?: string, 
    createdAt?: Date, 
    updatedAt?: Date,
    exampleUserPrompt?: string, 
}

export interface AssistantFilter {
    categoryId?: string, 
    q?: string, 
    includeInactive?: boolean, 
    page?: number,
    pageSize?: number,
}

export enum RunStatus {
    Pending = "pending",
    Success = "success",
    Failed = "failed",
}

export interface Run {
    id: string, 
    assistantId: string, 
    assistantName?: string,
    categoryId?: string, 
    categoryName?: string, 
    userId: string,
    model: string, 
    userPrompt: string, 
    output?: string,
    status: RunStatus, 
    error?: string, 
    createdAt?: Date,
}