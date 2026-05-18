type RunStartData = { run_id: string; status: string; created_at: string }
type ErrorData = { error: string }

export type SSEEvent =
  | { type: 'run_start'; data: RunStartData }
  | { type: 'chunk'; data: string }
  | { type: 'error'; data: ErrorData }
  | { type: 'end' }

export async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<SSEEvent> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    let eventType = ''
    let data = ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim()
      } else if (line.startsWith('data: ')) {
        data += line.slice(6)
      } else if (line === '' && eventType) {
        try {
          if (eventType === 'chunk') {
            yield { type: 'chunk', data }
          } else if (eventType === 'run_start') {
            yield { type: 'run_start', data: JSON.parse(data) as RunStartData }
          } else if (eventType === 'error') {
            yield { type: 'error', data: JSON.parse(data) as ErrorData }
          } else if (eventType === 'end') {
            yield { type: 'end' }
          }
        } catch {
          // skip malformed events
        }
        eventType = ''
        data = ''
      }
    }
  }
}
