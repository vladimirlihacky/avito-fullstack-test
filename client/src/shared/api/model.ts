import { createEffect, createStore, sample } from 'effector'
import { authApi, assistantsApi, categoriesApi, runsApi, systemApi } from './client'
import { tokenStorage } from './fetcher'
import type {
  AdminRunsListParams,
  Assistant,
  AssistantCreateInput,
  AssistantRunCreateInput,
  AssistantsListParams,
  AssistantsResponse,
  AssistantUpdateInput,
  CategoriesResponse,
  DummyLoginInput,
  LoginInput,
  RegisterInput,
  RunsListParams,
  RunsResponse,
  Token,
} from './types'

function createQuery<Params, Data>(fn: (params: Params) => Promise<Data>) {
  const fx = createEffect(fn)

  const $data = createStore<Data | null>(null).on(fx.doneData, (_, data) => data)
  const $pending = fx.pending
  const $error = createStore<Error | null>(null)
    .on(fx.failData, (_, err) => err)
    .reset(fx)

  return { fx, $data, $pending, $error }
}

function createMutation<Params, Data>(
  fn: (params: Params) => Promise<Data>,
  onSuccess?: (data: Data) => void,
) {
  const fx = createEffect(fn)

  const $pending = fx.pending
  const $error = createStore<Error | null>(null)
    .on(fx.failData, (_, err) => err)
    .reset(fx)

  if (onSuccess) {
    fx.doneData.watch(onSuccess)
  }

  return { fx, $pending, $error }
}


export const systemModel = {
  healthcheck: createQuery(() => systemApi.healthcheck()),
}

function createAuthMutation<TInput>(apiFn: (input: TInput) => Promise<Token>) {
  return createMutation(apiFn, (token) => tokenStorage.set(token.token))
}

export const authModel = {
  dummyLogin: createAuthMutation<DummyLoginInput>(authApi.dummyLogin),
  login: createAuthMutation<LoginInput>(authApi.login),
  register: createAuthMutation<RegisterInput>(authApi.register),
}

export const $currentToken = createStore<Token | null>(null)
  .on(authModel.dummyLogin.fx.doneData, (_, token) => token)
  .on(authModel.login.fx.doneData, (_, token) => token)
  .on(authModel.register.fx.doneData, (_, token) => token)


const listCategoriesFx = createEffect(categoriesApi.list)
const createCategoryFx = createEffect(categoriesApi.create)

export const categoriesModel = {
  list: {
    fx: listCategoriesFx,
    $data: createStore<CategoriesResponse | null>(null).on(
      listCategoriesFx.doneData,
      (_, data) => data,
    ),
    $pending: listCategoriesFx.pending,
    $error: createStore<Error | null>(null)
      .on(listCategoriesFx.failData, (_, err) => err)
      .reset(listCategoriesFx),
  },

  create: {
    fx: createCategoryFx,
    $pending: createCategoryFx.pending,
    $error: createStore<Error | null>(null)
      .on(createCategoryFx.failData, (_, err) => err)
      .reset(createCategoryFx),
  },
}

sample({
  clock: createCategoryFx.done,
  target: listCategoriesFx,
})

const listAssistantsFx = createEffect(
  (params: AssistantsListParams = {}) => assistantsApi.list(params),
)

const getAssistantFx = createEffect((assistantId: string) =>
  assistantsApi.get(assistantId),
)

const createAssistantFx = createEffect((input: AssistantCreateInput) =>
  assistantsApi.create(input),
)

const updateAssistantFx = createEffect(
  ({ assistantId, input }: { assistantId: string; input: AssistantUpdateInput }) =>
    assistantsApi.update(assistantId, input),
)

const runAssistantFx = createEffect(
  ({ assistantId, input }: { assistantId: string; input: AssistantRunCreateInput }) =>
    assistantsApi.run(assistantId, input),
)

const $assistantDetails = createStore<Record<string, Assistant>>({})
  .on(getAssistantFx.doneData, (state, assistant) => ({
    ...state,
    [assistant.id]: assistant,
  }))
  .on(updateAssistantFx.doneData, (state, assistant) => ({
    ...state,
    [assistant.id]: assistant,
  }))

export const assistantsModel = {
  list: {
    fx: listAssistantsFx,
    $data: createStore<AssistantsResponse | null>(null).on(
      listAssistantsFx.doneData,
      (_, data) => data,
    ),
    $pending: listAssistantsFx.pending,
    $error: createStore<Error | null>(null)
      .on(listAssistantsFx.failData, (_, err) => err)
      .reset(listAssistantsFx),
  },

  detail: {
    fx: getAssistantFx,
    $byId: $assistantDetails,
    $pending: getAssistantFx.pending,
    $error: createStore<Error | null>(null)
      .on(getAssistantFx.failData, (_, err) => err)
      .reset(getAssistantFx),
  },

  create: {
    fx: createAssistantFx,
    $pending: createAssistantFx.pending,
    $error: createStore<Error | null>(null)
      .on(createAssistantFx.failData, (_, err) => err)
      .reset(createAssistantFx),
  },

  update: {
    fx: updateAssistantFx,
    $pending: updateAssistantFx.pending,
    $error: createStore<Error | null>(null)
      .on(updateAssistantFx.failData, (_, err) => err)
      .reset(updateAssistantFx),
  },

  run: {
    fx: runAssistantFx,
    $pending: runAssistantFx.pending,
    $error: createStore<Error | null>(null)
      .on(runAssistantFx.failData, (_, err) => err)
      .reset(runAssistantFx),
  },
}

sample({
  clock: [createAssistantFx.done, updateAssistantFx.done],
  fn: () => ({}),
  target: listAssistantsFx,
})

const myRunsFx = createEffect((params: RunsListParams = {}) =>
  runsApi.myRuns(params),
)

const adminRunsFx = createEffect((params: AdminRunsListParams = {}) =>
  runsApi.adminRuns(params),
)

export const runsModel = {
  my: {
    fx: myRunsFx,
    $data: createStore<RunsResponse | null>(null).on(myRunsFx.doneData, (_, data) => data),
    $pending: myRunsFx.pending,
    $error: createStore<Error | null>(null)
      .on(myRunsFx.failData, (_, err) => err)
      .reset(myRunsFx),
  },

  admin: {
    fx: adminRunsFx,
    $data: createStore<RunsResponse | null>(null).on(adminRunsFx.doneData, (_, data) => data),
    $pending: adminRunsFx.pending,
    $error: createStore<Error | null>(null)
      .on(adminRunsFx.failData, (_, err) => err)
      .reset(adminRunsFx),
  },
}

sample({
  clock: runAssistantFx.done,
  fn: () => ({}),
  target: [myRunsFx, adminRunsFx],
})
