import { useState } from 'react'
import { StatusBadge } from '@/components/shared/status-badge'
import type { AssistantRun } from '@/shared/api/types'

type Props = {
  runs: AssistantRun[]
  showUser?: boolean
}

export function RunsTable({ runs, showUser = false }: Props) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Assistant</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            {showUser && <th className="text-left px-4 py-3 font-medium">User</th>}
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Prompt</th>
            <th className="text-left px-4 py-3 font-medium">Output</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <RunRow key={run.id} run={run} showUser={showUser} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RunRow({ run, showUser }: { run: AssistantRun; showUser: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="border-b hover:bg-muted/30 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 font-medium">{run.assistantName ?? run.assistantId}</td>
        <td className="px-4 py-3">
          <StatusBadge status={run.status} />
        </td>
        {showUser && (
          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{run.userId}</td>
        )}
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : '—'}
        </td>
        <td className="px-4 py-3 text-xs max-w-48 truncate">{run.userPrompt}</td>
        <td className="px-4 py-3 text-xs max-w-48 truncate">
          {run.output ?? run.error ?? '—'}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20 border-b">
          <td colSpan={showUser ? 6 : 5} className="px-4 py-3">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Prompt:</span>
                <p className="text-sm mt-0.5 whitespace-pre-wrap">{run.userPrompt}</p>
              </div>
              {run.output && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Output:</span>
                  <p className="text-sm mt-0.5 whitespace-pre-wrap">{run.output}</p>
                </div>
              )}
              {run.error && (
                <div>
                  <span className="text-xs font-medium text-destructive">Error:</span>
                  <p className="text-sm mt-0.5 text-destructive">{run.error}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
