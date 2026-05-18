import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { useUnit } from 'effector-react'
import { assistantsModel } from '@/shared/api/model'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { CategorySelect } from '@/components/shared/category-select'
import type { Assistant } from '@/shared/api/types'

type Props = {
  initial?: Assistant
}

export function AssistantForm({ initial }: Props) {
  const navigate = useNavigate()
  const create = assistantsModel.create
  const update = assistantsModel.update

  const isEdit = !!initial
  const mutation = isEdit ? update : create
  const pending = useUnit(mutation.$pending)
  const error = useUnit(mutation.$error)

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? '')
  const [exampleUserPrompt, setExampleUserPrompt] = useState(
    initial?.exampleUserPrompt ?? '',
  )
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const input = {
      categoryId,
      name,
      description,
      model,
      systemPrompt,
      exampleUserPrompt: exampleUserPrompt || null,
      isActive,
    }

    if (isEdit) {
      update.fx({ assistantId: initial!.id, input }).then(() => {
        navigate(`/assistants/${initial!.id}`, { replace: true })
      })
    } else {
      create.fx(input).then(() => {
        navigate('/assistants', { replace: true })
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name *</FieldLabel>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description *</FieldLabel>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="category">Category *</FieldLabel>
          <CategorySelect
            value={categoryId}
            onChange={(v) => setCategoryId(v ?? '')}
          />
          {!categoryId && (
            <p className="text-xs text-destructive mt-1">
              Category is required
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="model">Model *</FieldLabel>
          <Input
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="systemPrompt">System prompt *</FieldLabel>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            required
            rows={4}
            className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="exampleUserPrompt">
            Example user prompt
          </FieldLabel>
          <textarea
            id="exampleUserPrompt"
            value={exampleUserPrompt}
            onChange={(e) => setExampleUserPrompt(e.target.value)}
            rows={2}
            className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </Field>

        <Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-input"
            />
            Active
          </label>
        </Field>

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        <Field>
          <Button type="submit" disabled={pending || !categoryId}>
            {pending
              ? 'Saving...'
              : isEdit
                ? 'Save changes'
                : 'Create assistant'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
