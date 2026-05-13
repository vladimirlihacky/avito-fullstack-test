import type { Assistant } from '#/api/types'

export type AssistantCardProps = {
  assistant: Assistant
}

export default function AssistantCard({ assistant }: AssistantCardProps) {
  return <div className="assistant-card">{assistant.name}</div>
}
