import { Button } from '@/components/ui/button'

type Props = {
  message?: string
  onRetry?: () => void
}

export function ErrorBlock({ message, onRetry }: Props) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
      <p className="text-sm text-destructive font-medium">
        {message ?? 'Something went wrong'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
