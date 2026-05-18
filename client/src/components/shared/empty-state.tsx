import { cn } from '@/shared/utils'

type Props = {
  icon?: React.ReactNode
  title: string
  description?: string
  children?: React.ReactNode
}

export function EmptyState({ icon, title, description, children }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4')}>
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
