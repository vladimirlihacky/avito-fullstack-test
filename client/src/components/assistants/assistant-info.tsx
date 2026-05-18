import { useUnit } from 'effector-react'
import { $isAdmin } from '@/shared/api/model'
import type { Assistant } from '@/shared/api/types'

type Props = {
  assistant: Assistant
}

export function AssistantInfo({ assistant }: Props) {
  const isAdmin = useUnit($isAdmin)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
        <p className="text-sm mt-1">{assistant.description}</p>
      </div>

      <div className="flex gap-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
          <p className="text-sm mt-1">{assistant.model}</p>
        </div>
        {assistant.categoryName && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
            <p className="text-sm mt-1">{assistant.categoryName}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p className="text-sm mt-1">
            {assistant.isActive ? (
              <span className="text-emerald-600 font-medium">Active</span>
            ) : (
              <span className="text-muted-foreground">Inactive</span>
            )}
          </p>
        </div>
      </div>

      {assistant.exampleUserPrompt && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Example prompt</h3>
          <p className="text-sm mt-1 bg-muted rounded-md p-3 font-mono text-xs">
            {assistant.exampleUserPrompt}
          </p>
        </div>
      )}

      {isAdmin && assistant.systemPrompt && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">System prompt</h3>
          <p className="text-sm mt-1 bg-muted rounded-md p-3 text-xs whitespace-pre-wrap">
            {assistant.systemPrompt}
          </p>
        </div>
      )}
    </div>
  )
}
