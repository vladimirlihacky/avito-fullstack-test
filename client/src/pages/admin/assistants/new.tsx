import { PageHeader } from '@/components/shared/page-header'
import { AssistantForm } from '@/components/assistants/assistant-form'

export default function CreateAssistantPage() {
  return (
    <div className="p-6">
      <PageHeader title="New Assistant" backTo="/assistants" />
      <AssistantForm />
    </div>
  )
}
