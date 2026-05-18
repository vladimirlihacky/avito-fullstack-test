import { cn } from '@/shared/utils'
import type { RunStatus } from '@/shared/api/types'

const variantClasses: Record<RunStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
}

const labels: Record<RunStatus, string> = {
  pending: 'Pending',
  success: 'Success',
  failed: 'Failed',
}

type Props = {
  status: RunStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[status],
      )}
    >
      {labels[status]}
    </span>
  )
}
