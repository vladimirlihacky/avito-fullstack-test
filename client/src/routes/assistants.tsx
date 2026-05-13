import { useAssistants } from '#/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/assistants')({
  component: AssistantsPage,
})

function AssistantsPage() {
  const assistants = useAssistants()

  return (
    <div>
      {assistants.data?.assistants.map((assistant) => (
        <div key={assistant.id}>{assistant.name}</div>
      ))}
    </div>
  )
}
