import { apiFetch, buildQuery } from './fetcher'
import type {
  AdminRunsListParams,
  AssistantCreateInput,
  AssistantRun,
  AssistantRunCreateInput,
  AssistantsListParams,
  AssistantsResponse,
  AssistantUpdateInput,
  Assistant,
  CategoriesResponse,
  Category,
  CategoryCreateInput,
  DummyLoginInput,
  LoginInput,
  RegisterInput,
  RunsListParams,
  RunsResponse,
  Token,
} from './types'

export const systemApi = {
  healthcheck: (): Promise<void> => apiFetch('/_info', { skipAuth: true }),
}

export const authApi = {
  dummyLogin: (input: DummyLoginInput): Promise<Token> =>
    apiFetch('/dummyLogin', { method: 'POST', body: input, skipAuth: true }),

  login: (input: LoginInput): Promise<Token> =>
    apiFetch('/login', { method: 'POST', body: input, skipAuth: true }),

  register: (input: RegisterInput): Promise<Token> =>
    apiFetch('/register', { method: 'POST', body: input, skipAuth: true }),
}

export const categoriesApi = {
  list: (): Promise<CategoriesResponse> => apiFetch('/categories'),

  create: (input: CategoryCreateInput): Promise<Category> =>
    apiFetch('/categories', { method: 'POST', body: input }),
}

export const assistantsApi = {
  list: (params: AssistantsListParams = {}): Promise<AssistantsResponse> =>
    apiFetch(`/assistants${buildQuery(params)}`),

  get: (assistantId: string): Promise<Assistant> =>
    apiFetch(`/assistants/${assistantId}`),

  create: (input: AssistantCreateInput): Promise<Assistant> =>
    apiFetch('/assistants', { method: 'POST', body: input }),

  update: (
    assistantId: string,
    input: AssistantUpdateInput,
  ): Promise<Assistant> =>
    apiFetch(`/assistants/${assistantId}`, { method: 'PUT', body: input }),

  run: (
    assistantId: string,
    input: AssistantRunCreateInput,
  ): Promise<AssistantRun> =>
    apiFetch(`/assistants/${assistantId}/run`, { method: 'POST', body: input }),
}

export const runsApi = {
  myRuns: (params: RunsListParams = {}): Promise<RunsResponse> =>
    apiFetch(`/runs/my${buildQuery(params)}`),

  adminRuns: (params: AdminRunsListParams = {}): Promise<RunsResponse> =>
    apiFetch(`/admin/runs${buildQuery(params)}`),
}
