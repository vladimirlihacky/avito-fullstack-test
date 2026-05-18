import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}: Props) {
  const [local, setLocal] = useState(value)

  // Sync external value reset into local state
  useEffect(() => {
    if (value === '' && local !== '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocal(value)
    }
  }, [value, local])

  // Debounce: fire onChange after inactivity
  useEffect(() => {
    if (local === value) return
    const timer = setTimeout(() => onChange(local), debounceMs)
    return () => clearTimeout(timer)
  }, [local, debounceMs, value, onChange])

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  )
}
