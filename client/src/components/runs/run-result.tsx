import { StatusBadge } from '@/components/shared/status-badge'
import { Markdown } from '@/components/shared/markdown'
import type { AssistantRun } from '@/shared/api/types'

type Props = {
  run: AssistantRun
}

export function RunResult({ run }: Props) {
  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2">
        <StatusBadge status={run.status} />
        {run.model && (
          <span className="text-xs text-muted-foreground">{run.model}</span>
        )}
      </div>
      {run.status === 'success' && run.output && (
        <div className="rounded-md border bg-card p-4">
          <Markdown>{run.output}</Markdown>
        </div>
      )}
      {run.status === 'failed' && run.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{run.error}</p>
        </div>
      )}
    </div>
  )
}
