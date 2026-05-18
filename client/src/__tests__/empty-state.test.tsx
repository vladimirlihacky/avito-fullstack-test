import { describe, expect, test } from 'bun:test'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { EmptyState } from '@/components/shared/empty-state'

function render(el: React.ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    createRoot(container).render(el)
  })
  return container
}

describe('EmptyState', () => {
  test('renders title and description', () => {
    const container = render(
      <EmptyState title="No items" description="Nothing to show here" />,
    )
    expect(container.textContent).toContain('No items')
    expect(container.textContent).toContain('Nothing to show here')
  })

  test('renders optional action', () => {
    const container = render(
      <EmptyState title="No items">
        <button>Add item</button>
      </EmptyState>,
    )
    const btn = container.querySelector('button')!
    expect(btn.textContent).toBe('Add item')
  })

  test('renders without description', () => {
    const container = render(<EmptyState title="Empty" />)
    expect(container.textContent).toContain('Empty')
  })
})
