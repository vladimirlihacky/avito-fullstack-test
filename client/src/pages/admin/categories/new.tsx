import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { useUnit } from 'effector-react'
import { categoriesModel } from '@/shared/api/model'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

export default function CreateCategoryPage() {
  const navigate = useNavigate()
  const { pending, error } = useUnit({
    pending: categoriesModel.create.$pending,
    error: categoriesModel.create.$error,
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    categoriesModel.create
      .fx({ name: name.trim(), description: description || null })
      .then(() => {
        navigate('/assistants', { replace: true })
      })
  }

  return (
    <div className="p-6">
      <PageHeader title="New Category" backTo="/assistants" />

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name *</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Cooking, Programming"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description"
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <Field>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? 'Creating...' : 'Create category'}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
