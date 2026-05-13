import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Pagination from '@/components/Pagination'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useMyRuns } from '@/api/hooks'
import { useAuth } from '@/context/AuthContext'
import type { AssistantRun, RunStatus } from '@/api/types'
import { Label } from '@/components/ui/label'
import RunOutput from '@/components/RunOutput'

export const Route = createFileRoute('/runs/my')({
  component: MyRunsPage,
})

function truncate(text: string, maxLen: number) {
  const normalized = text.trim()
  if (normalized.length <= maxLen) return normalized
  return `${normalized.slice(0, maxLen)}…`
}

function MyRunsContent() {
  const pageSize = 10
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'all' | RunStatus>('all')
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
    setExpandedRunId(null)
  }, [statusFilter])

  const { data, isLoading, error } = useMyRuns({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    pageSize,
  })

  const runs = data?.runs ?? []
  const pagination = data?.pagination

  if (isLoading) return <div className="p-8">Loading runs...</div>
  if (error)
    return <div className="p-8 text-destructive">Error loading runs</div>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">My Runs</h1>

      <div className="flex flex-wrap gap-4 items-end rounded-md border p-4">
        <div className="flex flex-col gap-1">
          <Label>Status</Label>
          <select
            className="h-9 rounded-md border px-2"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{user?.email}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {!runs.length && (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No runs found for current filters.
            </CardContent>
          </Card>
        )}

        {runs.map((run: AssistantRun) => {
          const assistantLabel = run.assistantName ?? run.assistantId
          const answerText =
            run.status === 'success' ? (run.output ?? '') : (run.error ?? '')

          const isExpanded = expandedRunId === run.id

          return (
            <Card key={run.id}>
              <CardHeader>
                <CardTitle>{assistantLabel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <div>
                    Status: <span className="font-medium">{run.status}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Created:{' '}
                    {run.createdAt
                      ? new Date(run.createdAt).toLocaleString()
                      : '—'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium">User context</div>
                  <pre className="max-h-24 overflow-auto rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                    {truncate(run.userPrompt, 1200)}
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium">Answer</div>
                  <RunOutput
                    text={answerText}
                    maxLength={240}
                    expanded={isExpanded}
                    onExpandedChange={(next) =>
                      setExpandedRunId(next ? run.id : null)
                    }
                  />
                </div>

                <div className="flex gap-2">
                  {run.assistantId && (
                    <Button type="button" variant="outline" asChild>
                      <Link
                        to="/assistants/$assistantId"
                        params={{ assistantId: run.assistantId }}
                      >
                        Open assistant
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Pagination
        page={pagination?.page ?? page}
        pageSize={pagination?.pageSize ?? pageSize}
        total={pagination?.total ?? 0}
        onPageChange={(nextPage) => setPage(nextPage)}
      />
    </div>
  )
}

function MyRunsPage() {
  return (
    <ProtectedRoute>
      <MyRunsContent />
    </ProtectedRoute>
  )
}
