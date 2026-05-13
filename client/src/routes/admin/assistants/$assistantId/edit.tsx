import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAssistant, useUpdateAssistant, useCategories } from '@/api/hooks'
import type { AssistantUpdateInput } from '@/api/types'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/admin/assistants/$assistantId/edit')({
  component: EditAssistantPage,
})

function EditAssistantContent() {
  const { assistantId } = Route.useParams()
  const navigate = useNavigate()

  const { data: assistant, isLoading } = useAssistant(assistantId)
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<AssistantUpdateInput>({
    categoryId: '',
    name: '',
    description: '',
    model: '',
    systemPrompt: '',
    exampleUserPrompt: null,
    isActive: true,
  })

  useEffect(() => {
    if (assistant) {
      setFormData({
        categoryId: assistant.categoryId,
        name: assistant.name,
        description: assistant.description,
        model: assistant.model,
        systemPrompt: assistant.systemPrompt ?? '',
        exampleUserPrompt: assistant.exampleUserPrompt ?? null,
        isActive: assistant.isActive,
      })
    }
  }, [assistant])

  const updateMutation = useUpdateAssistant({
    onSuccess: () => {
      navigate({ to: `/assistants/${assistantId}` })
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : 'Failed to update assistant',
      )
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const input: AssistantUpdateInput = {
      ...formData,
      categoryId: formData.categoryId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      model: formData.model.trim(),
      systemPrompt: formData.systemPrompt.trim(),
      exampleUserPrompt: formData.exampleUserPrompt?.trim()
        ? formData.exampleUserPrompt.trim()
        : null,
    }

    if (!input.name) return setError('Name is required')
    if (!input.categoryId) return setError('Category is required')
    if (!input.systemPrompt) return setError('System prompt is required')

    updateMutation.mutate({ assistantId, input })
  }

  const categories = categoriesData?.categories ?? []
  const handleChange = <T extends keyof AssistantUpdateInput>(
    field: T,
    value: AssistantUpdateInput[T],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading || categoriesLoading)
    return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <Button onClick={() => window.history.back()} className="mb-4">
        Back
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="space-y-1">
              <Label>Category</Label>
              <select
                className="h-9 w-full rounded-md border px-2"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="assistant-name">Name</Label>
              <Input
                id="assistant-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="assistant-description">Description</Label>
              <Input
                id="assistant-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="assistant-model">Model</Label>
              <Input
                id="assistant-model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="assistant-system-prompt">System prompt</Label>
              <textarea
                id="assistant-system-prompt"
                value={formData.systemPrompt}
                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                className="h-32 w-full resize-y rounded-md border bg-input/20 px-2 py-1.5 text-sm"
                rows={4}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="assistant-example-context">
                Example user context
              </Label>
              <textarea
                id="assistant-example-context"
                value={formData.exampleUserPrompt ?? ''}
                onChange={(e) =>
                  handleChange('exampleUserPrompt', e.target.value || null)
                }
                className="h-24 w-full resize-y rounded-md border bg-input/20 px-2 py-1.5 text-sm"
                rows={3}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
              Active
            </label>

            <div>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function EditAssistantPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <EditAssistantContent />
    </ProtectedRoute>
  )
}
