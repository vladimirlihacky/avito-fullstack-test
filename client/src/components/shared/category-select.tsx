import { useEffect } from 'react'
import { useUnit } from 'effector-react'
import { categoriesModel } from '@/shared/api/model'

type Props = {
  value?: string
  onChange: (value: string | undefined) => void
}

export function CategorySelect({ value, onChange }: Props) {
  const { data, pending } = useUnit({
    data: categoriesModel.list.$data,
    pending: categoriesModel.list.$pending,
  })

  useEffect(() => {
    categoriesModel.list.fx()
  }, [])

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      disabled={pending}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">All categories</option>
      {data?.categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
