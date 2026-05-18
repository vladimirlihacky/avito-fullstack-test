import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SendIcon } from 'lucide-react'

type Props = {
  onSubmit: (userPrompt: string) => void
  pending: boolean
  error?: Error | null
  disabled?: boolean
}

export function RunForm({ onSubmit, pending, error, disabled }: Props) {
  const [userPrompt, setUserPrompt] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!userPrompt.trim() || pending) return
    onSubmit(userPrompt.trim())
    setUserPrompt('')
  }

  const blocked = pending || disabled

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2 items-end">
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder={
            disabled ? 'Assistant is inactive' : 'Enter your prompt...'
          }
          required
          rows={2}
          disabled={blocked}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          className="flex-1 min-h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={blocked || !userPrompt.trim()}
          className="shrink-0"
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2">{error.message}</p>
      )}
    </form>
  )
}
