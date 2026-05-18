import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Assistant } from '@/shared/api/types'

type Props = {
  assistant: Assistant
}

export function AssistantCard({ assistant }: Props) {
  return (
    <Link to={`/assistants/${assistant.id}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {assistant.name}
            </CardTitle>
            {!assistant.isActive && (
              <span className="shrink-0 rounded-full border border-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                Inactive
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assistant.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {assistant.categoryName && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {assistant.categoryName}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{assistant.model}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
