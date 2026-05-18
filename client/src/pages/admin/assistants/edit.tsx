import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useUnit } from 'effector-react'
import { assistantsModel } from '@/shared/api/model'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorBlock } from '@/components/shared/error-block'
import { AssistantForm } from '@/components/assistants/assistant-form'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditAssistantPage() {
  const { id } = useParams<{ id: string }>()

  const detail = useUnit(assistantsModel.detail.$byId)
  const pending = useUnit(assistantsModel.detail.$pending)
  const error = useUnit(assistantsModel.detail.$error)

  useEffect(() => {
    if (id) assistantsModel.detail.fx(id)
  }, [id])

  const assistant = id ? detail[id] : undefined

  return (
    <div className="p-6">
      <PageHeader
        title={assistant ? `Edit: ${assistant.name}` : 'Edit Assistant'}
        backTo={assistant ? `/assistants/${assistant.id}` : '/assistants'}
      />

      {pending && <Skeleton className="h-96 rounded-lg" />}

      {error && (
        <ErrorBlock
          message={error.message}
          onRetry={() => assistantsModel.detail.fx(id!)}
        />
      )}

      {assistant && <AssistantForm initial={assistant} />}
    </div>
  )
}
