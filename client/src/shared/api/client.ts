import { apiFetch, BASE_URL, buildQuery, tokenStorage } from './fetcher'
import type {
  AdminRunsListParams,
  Assistant,
  AssistantCreateInput,
  AssistantRun,
  AssistantRunCreateInput,
  AssistantsListParams,
  AssistantsResponse,
  AssistantUpdateInput,
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

  update: (assistantId: string, input: AssistantUpdateInput): Promise<Assistant> =>
    apiFetch(`/assistants/${assistantId}`, { method: 'PUT', body: input }),

  run: (assistantId: string, input: AssistantRunCreateInput): Promise<AssistantRun> =>
    apiFetch(`/assistants/${assistantId}/run`, { method: 'POST', body: input }),

  stream: async (assistantId: string, input: AssistantRunCreateInput): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    const token = tokenStorage.get()
    const response = await fetch(`${BASE_URL}/assistants/${assistantId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      let message = 'Stream failed'
      try {
        const err = await response.json() as { error?: { message?: string } }
        message = err.error?.message ?? message
      } catch { /* ignore */ }
      throw new Error(message)
    }
    return response.body!.getReader()
  },
}

export const runsApi = {
  myRuns: (params: RunsListParams = {}): Promise<RunsResponse> =>
    apiFetch(`/runs/my${buildQuery(params)}`),

  adminRuns: (params: AdminRunsListParams = {}): Promise<RunsResponse> =>
    apiFetch(`/admin/runs${buildQuery(params)}`),
}
