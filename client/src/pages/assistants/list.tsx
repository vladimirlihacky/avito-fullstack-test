import { useEffect } from 'react'
import { useUnit } from 'effector-react'
import { assistantsModel, $isAdmin } from '@/shared/api/model'
import { useQueryParams } from '@/hooks/use-query-params'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorBlock } from '@/components/shared/error-block'
import { EmptyState } from '@/components/shared/empty-state'
import { AssistantFilters } from '@/components/assistants/assistant-filters'
import { AssistantGrid } from '@/components/assistants/assistant-grid'
import { AssistantCard } from '@/components/assistants/assistant-card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import { BotIcon } from 'lucide-react'

export default function AssistantListPage() {
  const { getString, getBoolean, getNumber, setParams } = useQueryParams()
  const isAdmin = useUnit($isAdmin)
  const { data, pending, error } = useUnit({
    data: assistantsModel.list.$data,
    pending: assistantsModel.list.$pending,
    error: assistantsModel.list.$error,
  })

  const search = getString('q')
  const categoryId = getString('categoryId') || undefined
  const includeInactive = getBoolean('includeInactive')
  const page = getNumber('page', 1)!
  const pageSize = getNumber('pageSize', 10)!

  useEffect(() => {
    const params: Record<string, unknown> = {
      page,
      pageSize,
    }
    if (search) params.q = search
    if (categoryId) params.categoryId = categoryId
    if (includeInactive) params.includeInactive = true

    assistantsModel.list.fx(params)
  }, [search, categoryId, includeInactive, page, pageSize])

  const totalPages = data
    ? Math.ceil(data.pagination.total / data.pagination.pageSize)
    : 0

  return (
    <div className="p-6">
      <PageHeader
        title="AI Assistants"
        description="Browse and run AI assistants for your tasks"
      >
        {isAdmin && (
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/assistants/new">New assistant</Link>
          </Button>
        )}
      </PageHeader>

      <AssistantFilters
        search={search}
        categoryId={categoryId}
        includeInactive={includeInactive}
        onSearchChange={(v) => setParams({ q: v || null, page: 1 })}
        onCategoryChange={(v) => setParams({ categoryId: v, page: 1 })}
        onIncludeInactiveChange={(v) =>
          setParams({ includeInactive: v || null, page: 1 })
        }
      />

      {(pending || !data) && (
        <AssistantGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </AssistantGrid>
      )}

      {!pending && data && data.assistants.length === 0 && (
        <EmptyState
          icon={<BotIcon className="size-10" />}
          title="No assistants found"
          description="Try adjusting your search or filters"
        />
      )}

      {!pending && data && data.assistants.length > 0 && (
        <>
          {error && (
            <ErrorBlock
              message={error.message}
              onRetry={() =>
                assistantsModel.list.fx({
                  page,
                  pageSize,
                  q: search,
                  categoryId,
                  includeInactive,
                })
              }
            />
          )}
          <AssistantGrid>
            {data.assistants.map((a) => (
              <AssistantCard key={a.id} assistant={a} />
            ))}
          </AssistantGrid>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setParams({ page: page - 1 })}
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      Math.abs(p - page) <= 2 || p === 1 || p === totalPages,
                  )
                  .map((p, idx, arr) => (
                    <PaginationItem key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => setParams({ page: p })}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setParams({ page: page + 1 })}
                    />
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
