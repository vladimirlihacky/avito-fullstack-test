import { useEffect } from 'react'
import { useUnit } from 'effector-react'
import { runsModel } from '@/shared/api/model'
import { useQueryParams } from '@/hooks/use-query-params'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorBlock } from '@/components/shared/error-block'
import { EmptyState } from '@/components/shared/empty-state'
import { RunsTable } from '@/components/runs/runs-table'
import { RunsFilters } from '@/components/runs/runs-filters'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { PlayIcon } from 'lucide-react'
import type { RunStatus } from '@/shared/api/types'

export default function AdminRunsPage() {
  const { getString, getNumber, setParams } = useQueryParams()
  const { data, pending, error } = useUnit({
    data: runsModel.admin.$data,
    pending: runsModel.admin.$pending,
    error: runsModel.admin.$error,
  })

  const status = (getString('status') as RunStatus) || undefined
  const assistantFilter = getString('assistant') || undefined
  const page = getNumber('page', 1)!
  const pageSize = getNumber('pageSize', 20)!

  useEffect(() => {
    const params: Record<string, unknown> = { page, pageSize }
    if (status) params.status = status
    runsModel.admin.fx(params)
  }, [status, page, pageSize])

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.pageSize) : 0

  return (
    <div className="p-6">
      <PageHeader title="All Runs" description="View all assistant runs across users" />

      <RunsFilters
        status={status}
        onStatusChange={(v) => setParams({ status: v || null, page: 1 })}
        assistantFilter={assistantFilter}
        onAssistantFilter={(v) => setParams({ assistant: v || null, page: 1 })}
      />

      {(pending || !data) && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      )}

      {!pending && data && data.runs.length === 0 && (
        <EmptyState
          icon={<PlayIcon className="size-10" />}
          title="No runs yet"
          description="No assistant runs have been recorded"
        />
      )}

      {!pending && data && data.runs.length > 0 && (
        <>
          {error && (
            <ErrorBlock
              message={error.message}
              onRetry={() => runsModel.admin.fx({ page, pageSize, status })}
            />
          )}
          <RunsTable runs={data.runs} showUser />

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setParams({ page: page - 1 })} />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => (
                    <PaginationItem key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <PaginationLink isActive={p === page} onClick={() => setParams({ page: p })}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setParams({ page: page + 1 })} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
