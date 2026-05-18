import { useRef, useEffect, useCallback, useState } from 'react'
import { useStreamRun } from '@/hooks/use-stream-run'
import { RunForm } from './run-form'
import { Markdown } from '@/components/shared/markdown'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/shared/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

type Props = {
  assistantId: string
  disabled: boolean
}

type Message = {
  role: 'user'
  content: string
} | {
  role: 'assistant'
  content: string
  isStreaming: boolean
  isError: boolean
}

export function StreamChat({ assistantId, disabled }: Props) {
  const { chunks, output, isStreaming, error, start } = useStreamRun(assistantId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [prompts, setPrompts] = useState<string[]>([])

  const handleSubmit = useCallback(
    (prompt: string) => {
      setPrompts((prev) => [...prev, prompt])
      start(prompt)
    },
    [start],
  )

  // Derive messages from state during render — no effect needed
  const messages: Message[] = prompts.map((p) => ({ role: 'user' as const, content: p }))

  if (prompts.length > 0) {
    messages.push({
      role: 'assistant',
      content: output,
      isStreaming,
      isError: !!error && !isStreaming,
    })
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chunks])

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[400px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1 mb-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Enter a prompt below to run this assistant
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex gap-3 justify-end mb-4">
                <div className="min-w-0 max-w-[80%]">
                  <Card className="p-3 bg-primary text-primary-foreground">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                </div>
                <div className="shrink-0 size-7 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold">U</span>
                </div>
              </div>
            )
          }

          return (
            <div key={i} className="flex gap-3 mb-4">
              <div className="shrink-0 size-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">AI</span>
              </div>
              <div className="min-w-0 flex-1">
                {msg.isStreaming && !msg.content && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                )}

                {msg.content && (
                  <Card
                    className={cn(
                      'p-4',
                      msg.isStreaming && 'border-primary/30 shadow-sm shadow-primary/10',
                      msg.isError && 'border-destructive/50 bg-destructive/5',
                    )}
                  >
                    {msg.isError ? (
                      <div>
                        <StatusBadge status="failed" />
                        <p className="text-sm text-destructive mt-2 wrap-break-word">
                          {msg.content || error?.message || 'Unknown error'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Markdown>{msg.content}</Markdown>
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle rounded-sm" />
                        )}
                        {!msg.isStreaming && !msg.isError && (
                          <div className="mt-2">
                            <StatusBadge status="success" />
                          </div>
                        )}
                      </>
                    )}
                  </Card>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="shrink-0">
        <RunForm
          onSubmit={handleSubmit}
          pending={isStreaming}
          error={null}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
