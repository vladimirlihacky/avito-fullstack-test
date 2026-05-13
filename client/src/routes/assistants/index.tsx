import { createFileRoute, Link } from '@tanstack/react-router'
import { memo, useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Pagination from '@/components/Pagination'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Input } from '@/components/ui/input'
import { useAssistants, useCategories } from '@/api/hooks'
import { useAuth } from '@/context/AuthContext'
import type { Assistant, Category } from '@/api/types'
import type { AuthUser } from '@/context/AuthContext'

const searchSchema = z.object({
  page:         z.number().int().min(1).catch(1),
  categoryId:   z.string().optional().catch(undefined),
  q:            z.string().optional().catch(undefined),
  showInactive: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/assistants/')({
  validateSearch: searchSchema,
  component: AssistantsPage,
})

const SearchInput = memo(({ defaultValue, onChange }: {
  defaultValue: string
  onChange: (v: string) => void
}) => {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    const timer = setTimeout(() => onChange(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <Input
      value={value}
      placeholder="Search by name or description"
      onChange={(e) => setValue(e.target.value)}
    />
  )
})

const AssistantsList = memo(({ assistants, user }: {
  assistants: Assistant[]
  user: AuthUser | null
}) => {
  if (!assistants.length) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          No assistants found for current filters.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {assistants.map((assistant) => (
        <Card key={assistant.id}>
          <CardHeader>
            <CardTitle>{assistant.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{assistant.description}</p>
            <div className="mt-4 flex gap-2">
              <Button asChild>
                <Link to="/assistants/$assistantId" params={{ assistantId: assistant.id }}>
                  View details
                </Link>
              </Button>
              {user?.role === 'admin' && (
                <Button variant="outline" asChild>
                  <Link
                    to="/admin/assistants/$assistantId/edit"
                    params={{ assistantId: assistant.id }}
                  >
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

function AssistantsPageContent() {
  const pageSize = 10
  const { user } = useAuth()

  const { page, categoryId, q, showInactive } = Route.useSearch()
  const navigate = Route.useNavigate()

  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({
        search: (prev) => ({ ...prev, ...patch }),
        replace: true,
      }),
    [navigate],
  )

  const handleCategoryChange = useCallback(
    (v: string | undefined) => setFilter({ categoryId: v, page: 1 }),
    [setFilter],
  )

  const handleQChange = useCallback(
    (v: string) => setFilter({ q: v || undefined, page: 1 }),
    [setFilter],
  )

  const handlePageChange = useCallback(
    (v: number) => setFilter({ page: v }),
    [setFilter],
  )

  const handleShowInactiveChange = useCallback(
    (v: boolean) => setFilter({ showInactive: v || undefined, page: 1 }),
    [setFilter],
  )

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories()

  const includeInactive =
    user?.role === 'admin' && showInactive ? true : undefined

  const {
    data: assistantsData,
    isLoading: assistantsLoading,
    error: assistantsError,
  } = useAssistants({
    categoryId,
    q: q?.trim() || undefined,
    includeInactive,
    page,
    pageSize,
  })

  const assistants = assistantsData?.assistants ?? []
  const pagination = assistantsData?.pagination
  const categories: Category[] = categoriesData?.categories ?? []

  if (assistantsLoading || categoriesLoading) {
    return <div className="p-8">Loading assistants...</div>
  }

  if (assistantsError || categoriesError) {
    return <div className="p-8 text-destructive">Error loading assistants</div>
  }

  return (
    <div className="mt-4 flex-1 overflow-y-auto space-y-4 pb-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">Category</div>
            <select
              className="h-9 rounded-md border px-2"
              value={categoryId ?? ''}
              onChange={(e) => handleCategoryChange(e.target.value || undefined)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 grow min-w-60">
            <div className="text-sm font-medium">Search</div>
            <SearchInput
              defaultValue={q ?? ''}
              onChange={handleQChange}
            />
          </div>

          {user?.role === 'admin' && (
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                type="checkbox"
                checked={!!showInactive}
                onChange={(e) => handleShowInactiveChange(e.target.checked)}
              />
              Show inactive
            </label>
          )}
        </div>
      </div>

      <AssistantsList assistants={assistants} user={user} />

      <div className="sticky bottom-0 border-t bg-background/95 py-3">
        <Pagination
          page={pagination?.page ?? page}
          pageSize={pagination?.pageSize ?? pageSize}
          total={pagination?.total ?? 0}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

function AssistantsPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-[calc(100vh-1rem)] flex-col p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Assistants catalog</h1>
        <AssistantsPageContent />
      </div>
    </ProtectedRoute>
  )
}