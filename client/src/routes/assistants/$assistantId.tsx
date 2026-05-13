import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useAssistant, useRunAssistant } from '@/api/hooks'

export const Route = createFileRoute('/assistants/$assistantId')({
  component: AssistantDetailPage,
})

function AssistantDetailContent() {
  const { assistantId } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: assistant, isLoading, error } = useAssistant(assistantId)
  const runMutation = useRunAssistant()

  const [userPrompt, setUserPrompt] = useState('')
  const [lastRunOutput, setLastRunOutput] = useState<string | null>(null)
  const [lastRunError, setLastRunError] = useState<string | null>(null)
  const [lastStatus, setLastStatus] = useState<
    'idle' | 'pending' | 'success' | 'failed'
  >('idle')

  const canViewSystemPrompt = user?.role === 'admin'
  const isRunDisabled = useMemo(() => {
    return !assistant || !assistant.isActive || runMutation.isPending
  }, [assistant, runMutation.isPending])

  const handleRun = async (e: FormEvent) => {
    e.preventDefault()
    if (!assistant) return

    setLastRunOutput(null)
    setLastRunError(null)
    setLastStatus('pending')

    try {
      const run = await runMutation.mutateAsync({
        assistantId,
        input: { userPrompt: userPrompt.trim() },
      })

      if (run.status === 'failed') {
        setLastRunError(run.error ?? 'Run failed')
        setLastStatus('failed')
        return
      }

      setLastRunOutput(run.output)
      setLastStatus('success')
    } catch (err) {
      setLastRunError(err instanceof Error ? err.message : 'Run failed')
      setLastStatus('failed')
    }
  }

  if (isLoading) return <div className="p-8">Loading assistant...</div>
  if (error)
    return <div className="p-8 text-destructive">Error loading assistant</div>
  if (!assistant) return <div className="p-8">Assistant not found</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/assistants' })}
        >
          Back
        </Button>
        {lastStatus !== 'idle' && (
          <div className="text-sm">
            Status: <span className="font-medium">{lastStatus}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{assistant.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium">Description</div>
            <div className="text-sm text-muted-foreground">
              {assistant.description}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium">Model</div>
            <div className="text-sm text-muted-foreground">
              {assistant.model}
            </div>
          </div>

          {assistant.categoryName && (
            <div>
              <div className="text-sm font-medium">Category</div>
              <div className="text-sm text-muted-foreground">
                {assistant.categoryName}
              </div>
            </div>
          )}

          {assistant.exampleUserPrompt && (
            <div>
              <div className="text-sm font-medium">Example user context</div>
              <pre className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">
                {assistant.exampleUserPrompt}
              </pre>
            </div>
          )}

          {canViewSystemPrompt && assistant.systemPrompt && (
            <div>
              <div className="text-sm font-medium">System prompt (admin)</div>
              <pre className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">
                {assistant.systemPrompt}
              </pre>
            </div>
          )}

          {user?.role === 'admin' && (
            <div>
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ to: `/admin/assistants/${assistantId}/edit` })
                }
              >
                Edit assistant
              </Button>
            </div>
          )}

          {!assistant.isActive && (
            <div className="rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
              This assistant is currently inactive and cannot be run.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRun} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="userPrompt">Your context</Label>
              <textarea
                id="userPrompt"
                className="h-32 w-full resize-y rounded-md border bg-input/20 px-2 py-1.5 text-sm"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter user context for this assistant..."
                required
              />
            </div>

            <div className="flex gap-2 items-center">
              <Button type="submit" disabled={isRunDisabled}>
                {runMutation.isPending ? 'Running...' : 'Run'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setUserPrompt(assistant.exampleUserPrompt ?? '')}
                disabled={!assistant.exampleUserPrompt || runMutation.isPending}
              >
                Use example
              </Button>
            </div>
          </form>

          {lastRunError && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Error: {lastRunError}
            </div>
          )}

          {lastRunOutput && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">Answer</div>
              <pre className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">
                {lastRunOutput}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AssistantDetailPage() {
  return (
    <ProtectedRoute>
      <AssistantDetailContent />
    </ProtectedRoute>
  )
}
