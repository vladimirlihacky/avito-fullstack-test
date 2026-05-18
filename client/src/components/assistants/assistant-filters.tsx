import { useUnit } from 'effector-react'
import { $isAdmin } from '@/shared/api/model'
import { SearchInput } from '@/components/shared/search-input'
import { CategorySelect } from '@/components/shared/category-select'

type Props = {
  search: string
  categoryId?: string
  includeInactive: boolean
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string | undefined) => void
  onIncludeInactiveChange: (value: boolean) => void
}

export function AssistantFilters({
  search,
  categoryId,
  includeInactive,
  onSearchChange,
  onCategoryChange,
  onIncludeInactiveChange,
}: Props) {
  const isAdmin = useUnit($isAdmin)

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="w-full sm:w-64">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search assistants..."
        />
      </div>
      <div className="w-full sm:w-48">
        <CategorySelect value={categoryId} onChange={onCategoryChange} />
      </div>
      {isAdmin && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => onIncludeInactiveChange(e.target.checked)}
            className="rounded border-input"
          />
          Show inactive
        </label>
      )}
    </div>
  )
}
