import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useCategories, useCreateAssistant } from '@/api/hooks'
import type { AssistantCreateInput } from '@/api/types'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/admin/assistants/new')({
  component: NewAssistantPage,
})

function NewAssistantContent() {
  const navigate = useNavigate()
  const categoriesQuery = useCategories()

  const [formData, setFormData] = useState<AssistantCreateInput>({
    name: '',
    description: '',
    categoryId: '',
    model: 'gpt-4',
    systemPrompt: '',
    exampleUserPrompt: null,
    isActive: true,
  })

  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateAssistant({
    onSuccess: (assistant) => {
      navigate({ to: `/admin/assistants/${assistant.id}/edit` })
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : 'Failed to create assistant',
      )
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      model: formData.model.trim(),
      categoryId: formData.categoryId,
      systemPrompt: formData.systemPrompt.trim(),
      exampleUserPrompt: formData.exampleUserPrompt?.trim()
        ? formData.exampleUserPrompt.trim()
        : null,
    }

    if (!trimmed.name) return setError('Name is required')
    if (!trimmed.categoryId) return setError('Category is required')
    if (!trimmed.systemPrompt) return setError('System prompt is required')

    createMutation.mutate({
      ...trimmed,
      isActive: trimmed.isActive ?? true,
    })
  }

  const handleChange = <T extends keyof AssistantCreateInput>(
    field: T,
    value: AssistantCreateInput[T],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (categoriesQuery.isLoading) {
    return <div className="p-8">Loading categories...</div>
  }

  if (categoriesQuery.error) {
    return <div className="p-8 text-destructive">Error loading categories</div>
  }

  const categories = categoriesQuery.data?.categories ?? []

  return (
    <div className="p-8">
      <Button onClick={() => window.history.back()} className="mb-4">
        Back
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="space-y-1">
              <div className="text-sm font-medium">Category</div>
              <select
                className="h-9 w-full rounded-md border px-2"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
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
                required
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
              <Label htmlFor="assistant-example-prompt">
                Example user context
              </Label>
              <textarea
                id="assistant-example-prompt"
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

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function NewAssistantPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <NewAssistantContent />
    </ProtectedRoute>
  )
}
