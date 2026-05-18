import { useCallback, useState } from 'react'
import { assistantsApi } from '@/shared/api/client'
import { parseSSEStream } from '@/shared/api/sse'

export function useStreamRun(assistantId: string) {
  const [chunks, setChunks] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [runId, setRunId] = useState<string | null>(null)

  const start = useCallback(
    async (userPrompt: string) => {
      setChunks([])
      setIsStreaming(true)
      setError(null)
      setRunId(null)

      try {
        const reader = await assistantsApi.stream(assistantId, { userPrompt })
        for await (const event of parseSSEStream(reader)) {
          if (event.type === 'run_start') {
            setRunId(event.data.run_id)
          } else if (event.type === 'chunk') {
            setChunks((prev) => [...prev, event.data])
          } else if (event.type === 'error') {
            setError(new Error(event.data.error))
          } else if (event.type === 'end') {
            break
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsStreaming(false)
      }
    },
    [assistantId],
  )

  return {
    chunks,
    output: chunks.join(''),
    isStreaming,
    error,
    runId,
    start,
  }
}
