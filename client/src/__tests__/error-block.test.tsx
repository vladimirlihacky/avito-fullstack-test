import { describe, expect, test, mock } from 'bun:test'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { ErrorBlock } from '@/components/shared/error-block'

function render(el: React.ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    createRoot(container).render(el)
  })
  return container
}

describe('ErrorBlock', () => {
  test('renders error message', () => {
    const container = render(<ErrorBlock message="Something broke" />)
    expect(container.textContent).toContain('Something broke')
  })

  test('shows default message when none provided', () => {
    const container = render(<ErrorBlock />)
    expect(container.textContent).toContain('Something went wrong')
  })

  test('calls onRetry when retry button clicked', () => {
    const onRetry = mock(() => {})
    const container = render(
      <ErrorBlock message="Error" onRetry={onRetry} />,
    )
    const btn = container.querySelector('button')!
    act(() => btn.click())
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  test('hides retry button when onRetry not provided', () => {
    const container = render(<ErrorBlock message="Error" />)
    expect(container.querySelector('button')).toBeNull()
  })
})
