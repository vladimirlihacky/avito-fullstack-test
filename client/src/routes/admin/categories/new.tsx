import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useCreateCategory } from '@/api/hooks'
import type { CategoryCreateInput } from '@/api/types'

export const Route = createFileRoute('/admin/categories/new')({
  component: NewCategoryPage,
})

function NewCategoryContent() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const createMutation = useCreateCategory({
    onSuccess: () => {
      navigate({ to: '/assistants' })
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const input: CategoryCreateInput = {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
    }

    if (!input.name) return
    createMutation.mutate(input)
  }

  return (
    <div className="p-8">
      <Button onClick={() => window.history.back()} className="mb-4">
        Back
      </Button>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              placeholder="Category description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

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

function NewCategoryPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <NewCategoryContent />
    </ProtectedRoute>
  )
}
