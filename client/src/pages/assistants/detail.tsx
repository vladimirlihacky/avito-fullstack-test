import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useUnit } from 'effector-react'
import { assistantsModel, $isAdmin } from '@/shared/api/model'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorBlock } from '@/components/shared/error-block'
import { AssistantInfo } from '@/components/assistants/assistant-info'
import { StreamChat } from '@/components/runs/stream-chat'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router'

export default function AssistantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isAdmin = useUnit($isAdmin)

  const detail = useUnit(assistantsModel.detail.$byId)
  const detailPending = useUnit(assistantsModel.detail.$pending)
  const detailError = useUnit(assistantsModel.detail.$error)

  useEffect(() => {
    if (id) assistantsModel.detail.fx(id)
  }, [id])

  if (!id) return null

  const assistant = detail[id]

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={assistant?.name ?? 'Assistant'}
        backTo="/assistants"
        description={assistant ? undefined : 'Loading...'}
      >
        {isAdmin && assistant && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/admin/assistants/${assistant.id}/edit`}>Edit</Link>
          </Button>
        )}
      </PageHeader>

      {(detailPending || !assistant) && (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-lg" />
        </div>
      )}

      {!detailPending && detailError && (
        <ErrorBlock
          message={detailError.message}
          onRetry={() => assistantsModel.detail.fx(id)}
        />
      )}

      {assistant && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <AssistantInfo assistant={assistant} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Run assistant</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)]">
                <StreamChat
                  assistantId={id}
                  disabled={!assistant.isActive}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
