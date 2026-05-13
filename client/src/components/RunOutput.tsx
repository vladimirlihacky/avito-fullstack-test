import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

export type RunOutputProps = {
  text: string | null | undefined
  maxLength?: number
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

export default function RunOutput({
  text,
  maxLength = 240,
  expanded: expandedProp,
  onExpandedChange,
}: RunOutputProps) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const expanded = expandedProp ?? internalExpanded

  const normalized = useMemo(() => text ?? '', [text])
  const trimmed = normalized.trim()
  const isTruncated = trimmed.length > maxLength

  const displayText = !trimmed
    ? '—'
    : !isTruncated || expanded
      ? trimmed
      : `${trimmed.slice(0, maxLength)}…`

  const toggle = () => {
    const next = !expanded
    if (expandedProp !== undefined && onExpandedChange) {
      onExpandedChange(next)
      return
    }
    setInternalExpanded(next)
  }

  return (
    <div className="space-y-2">
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
        {displayText}
      </pre>

      {isTruncated && (
        <Button type="button" variant="outline" size="sm" onClick={toggle}>
          {expanded ? 'Hide full' : 'Show full'}
        </Button>
      )}
    </div>
  )
}
