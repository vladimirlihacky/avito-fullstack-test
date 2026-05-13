import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Pagination from '@/components/Pagination'
import RunOutput from '@/components/RunOutput'
import { useAdminRuns, useAssistants } from '@/api/hooks'
import type { AssistantRun, AdminRunsListParams, RunStatus } from '@/api/types'

export const Route = createFileRoute('/admin/runs')({
  component: AdminRunsPage,
})

function AdminRunsContent() {
  const pageSize = 20

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'all' | RunStatus>('all')
  const [assistantId, setAssistantId] = useState<string | undefined>(undefined)
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
    setExpandedRunId(null)
  }, [status, assistantId])

  const assistantsForSelect = useAssistants({
    includeInactive: true,
    page: 1,
    pageSize: 100,
  })

  const params: AdminRunsListParams = {
    assistantId,
    status: status === 'all' ? undefined : status,
    page,
    pageSize,
  }

  const { data, isLoading, error } = useAdminRuns(params)

  const runs = data?.runs ?? []
  const pagination = data?.pagination

  const assistantOptions = assistantsForSelect.data?.assistants ?? []

  const answerTextForRun = (run: AssistantRun) => {
    if (run.status === 'success') return run.output ?? ''
    if (run.status === 'failed') return run.error ?? ''
    return ''
  }

  const assistantLabelForRun = (run: AssistantRun) =>
    run.assistantName ?? run.assistantId

  if (isLoading || assistantsForSelect.isLoading)
    return <div className="p-8">Loading runs...</div>
  if (error || assistantsForSelect.error)
    return <div className="p-8 text-destructive">Error loading runs</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">All Runs</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setExpandedRunId(null)}
          >
            Collapse
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <Label>Status</Label>
              <select
                className="h-9 rounded-md border px-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Assistant</Label>
              <select
                className="h-9 w-[260px] rounded-md border px-2"
                value={assistantId ?? ''}
                onChange={(e) =>
                  setAssistantId(e.target.value ? e.target.value : undefined)
                }
              >
                <option value="">All assistants</option>
                {assistantOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        {!runs.length ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No runs found for current filters.
            </CardContent>
          </Card>
        ) : (
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 text-left">Run ID</th>
                <th className="border border-border p-2 text-left">
                  Assistant
                </th>
                <th className="border border-border p-2 text-left">User</th>
                <th className="border border-border p-2 text-left">Status</th>
                <th className="border border-border p-2 text-left">Created</th>
                <th className="border border-border p-2 text-left">Output</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run: AssistantRun) => {
                const isExpanded = expandedRunId === run.id
                const answerText = answerTextForRun(run)

                return (
                  <tr key={run.id} className="align-top hover:bg-muted/40">
                    <td className="border border-border p-2">{run.id}</td>
                    <td className="border border-border p-2">
                      {assistantLabelForRun(run)}
                    </td>
                    <td className="border border-border p-2">{run.userId}</td>
                    <td className="border border-border p-2">{run.status}</td>
                    <td className="border border-border p-2">
                      {run.createdAt
                        ? new Date(run.createdAt).toLocaleString()
                        : '—'}
                    </td>
                    <td className="border border-border p-2">
                      <RunOutput
                        text={answerText}
                        maxLength={260}
                        expanded={isExpanded}
                        onExpandedChange={(next) =>
                          setExpandedRunId(next ? run.id : null)
                        }
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
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

function AdminRunsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminRunsContent />
    </ProtectedRoute>
  )
}
