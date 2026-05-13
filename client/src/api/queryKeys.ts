import type { AssistantsListParams, AdminRunsListParams, RunsListParams } from "./types";

export const queryKeys = {
  system: {
    all: () => ["system"] as const,
    health: () => ["system", "health"] as const,
  },

  categories: {
    all: () => ["categories"] as const,
    list: () => ["categories", "list"] as const,
  },

  assistants: {
    all: () => ["assistants"] as const,
    lists: () => ["assistants", "list"] as const,
    list: (params: AssistantsListParams) => ["assistants", "list", params] as const,
    details: () => ["assistants", "detail"] as const,
    detail: (id: string) => ["assistants", "detail", id] as const,
  },

  runs: {
    all: () => ["runs"] as const,
    my: (params: RunsListParams) => ["runs", "my", params] as const,
    admin: (params: AdminRunsListParams) => ["runs", "admin", params] as const,
  },
} as const;