import { Button } from '@/components/ui/button'

export type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="flex gap-2 items-center">
      <Button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={!hasPrev}
      >
        Previous
      </Button>
      <span className="flex items-center">
        Page {page} / {totalPages}
      </span>
      <Button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
      >
        Next
      </Button>
    </div>
  )
}
