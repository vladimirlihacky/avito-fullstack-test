import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import {
  authApi,
  assistantsApi,
  categoriesApi,
  runsApi,
  systemApi,
} from './client'
import { tokenStorage } from './fetcher'
import { queryKeys } from './queryKeys'
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

// ─────────────────────────────────────────────
// System
// ─────────────────────────────────────────────

export function useHealthcheck(
  options?: Omit<UseQueryOptions<void>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.system.health(),
    queryFn: () => systemApi.healthcheck(),
  })
}

function useAuthMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Token>,
  options?: UseMutationOptions<Token, Error, TInput>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn,
    onSuccess: (data, variables, onMutateResult, context) => {
      tokenStorage.set(data.token)
      queryClient.invalidateQueries()
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function useDummyLogin(
  options?: UseMutationOptions<Token, Error, DummyLoginInput>,
) {
  return useAuthMutation(authApi.dummyLogin, options)
}

export function useLogin(
  options?: UseMutationOptions<Token, Error, LoginInput>,
) {
  return useAuthMutation(authApi.login, options)
}

export function useRegister(
  options?: UseMutationOptions<Token, Error, RegisterInput>,
) {
  return useAuthMutation(authApi.register, options)
}

export function useCategories(
  options?: Omit<UseQueryOptions<CategoriesResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoriesApi.list(),
  })
}

export function useCreateCategory(
  options?: UseMutationOptions<Category, Error, CategoryCreateInput>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: categoriesApi.create,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function useAssistants(
  params: AssistantsListParams = {},
  options?: Omit<UseQueryOptions<AssistantsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.assistants.list(params),
    queryFn: () => assistantsApi.list(params),
  })
}

export function useAssistant(
  assistantId: string,
  options?: Omit<UseQueryOptions<Assistant>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.assistants.detail(assistantId),
    queryFn: () => assistantsApi.get(assistantId),
  })
}

export function useCreateAssistant(
  options?: UseMutationOptions<Assistant, Error, AssistantCreateInput>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: assistantsApi.create,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants.lists() })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

interface UpdateAssistantVariables {
  assistantId: string
  input: AssistantUpdateInput
}

export function useUpdateAssistant(
  options?: UseMutationOptions<Assistant, Error, UpdateAssistantVariables>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ assistantId, input }) =>
      assistantsApi.update(assistantId, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assistants.lists() })
      queryClient.setQueryData(
        queryKeys.assistants.detail(variables.assistantId),
        data,
      )
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

interface RunAssistantVariables {
  assistantId: string
  input: AssistantRunCreateInput
}

export function useRunAssistant(
  options?: UseMutationOptions<AssistantRun, Error, RunAssistantVariables>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ assistantId, input }) =>
      assistantsApi.run(assistantId, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs.all() })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function useMyRuns(
  params: RunsListParams = {},
  options?: Omit<UseQueryOptions<RunsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.runs.my(params),
    queryFn: () => runsApi.myRuns(params),
  })
}

export function useAdminRuns(
  params: AdminRunsListParams = {},
  options?: Omit<UseQueryOptions<RunsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.runs.admin(params),
    queryFn: () => runsApi.adminRuns(params),
  })
}
