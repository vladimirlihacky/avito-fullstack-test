export type Role = 'admin' | 'user'
export type RunStatus = 'pending' | 'success' | 'failed'

export type ApiError = {
  error: {
    code: string
    message: string
  }
}

export type Pagination = {
  page: number
  pageSize: number
  total: number
}

export type User = {
  id: string
  email: string
  role: Role
  createdAt: string | null
}

export type Token = {
  token: string
  user: User
}

export type DummyLoginInput = {
  role: Role
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
}

export type Category = {
  id: string
  name: string
  description: string | null
  createdAt: string | null
}

export type CategoryCreateInput = {
  name: string
  description?: string | null
}

export type CategoriesResponse = {
  categories: Category[]
}

export type Assistant = {
  id: string
  categoryId: string
  categoryName: string | null
  name: string
  description: string
  model: string
  systemPrompt: string | null
  exampleUserPrompt: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type AssistantCreateInput = {
  categoryId: string
  name: string
  description: string
  model: string
  systemPrompt: string
  exampleUserPrompt?: string | null
  isActive?: boolean
}

export type AssistantUpdateInput = {
  categoryId: string
  name: string
  description: string
  model: string
  systemPrompt: string
  exampleUserPrompt?: string | null
  isActive: boolean
}

export type AssistantsListParams = {
  categoryId?: string
  q?: string
  includeInactive?: boolean
  page?: number
  pageSize?: number
}

export type AssistantsResponse = {
  assistants: Assistant[]
  pagination: Pagination
}

export type AssistantRun = {
  id: string
  assistantId: string
  assistantName: string | null
  categoryId: string | null
  categoryName: string | null
  userId: string
  model: string
  userPrompt: string
  output: string | null
  status: RunStatus
  error: string | null
  createdAt: string | null
}

export type AssistantRunCreateInput = {
  userPrompt: string
}

export type RunsListParams = {
  status?: RunStatus
  page?: number
  pageSize?: number
}

export type AdminRunsListParams = RunsListParams & {
  assistantId?: string
}

export type RunsResponse = {
  runs: AssistantRun[]
  pagination: Pagination
}
