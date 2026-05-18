import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'

type Props = {
  title: string
  description?: string
  backTo?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, backTo, children }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3 min-w-0">
        {backTo && (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0 mt-0.5"
          >
            <Link to={backTo}>
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  )
}
