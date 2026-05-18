import type { RunStatus } from '@/shared/api/types'

const statusOptions: { label: string; value: RunStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
]

type Props = {
  status?: RunStatus
  onStatusChange: (value: RunStatus | undefined) => void
  assistantFilter?: string
  onAssistantFilter?: (value: string) => void
}

export function RunsFilters({ status, onStatusChange, assistantFilter, onAssistantFilter }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <select
        value={status ?? ''}
        onChange={(e) => onStatusChange((e.target.value as RunStatus) || undefined)}
        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {onAssistantFilter && (
        <input
          type="text"
          value={assistantFilter ?? ''}
          onChange={(e) => onAssistantFilter(e.target.value)}
          placeholder="Filter by assistant name..."
          className="flex h-9 w-56 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      )}
    </div>
  )
}
