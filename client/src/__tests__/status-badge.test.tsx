import { describe, expect, test } from 'bun:test'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { StatusBadge } from '@/components/shared/status-badge'

function render(el: React.ReactElement) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    createRoot(container).render(el)
  })
  return container
}

describe('StatusBadge', () => {
  test('renders pending status with amber color', () => {
    const container = render(<StatusBadge status="pending" />)
    const span = container.querySelector('span')!
    expect(span.textContent).toBe('Pending')
    expect(span.className).toContain('amber')
  })

  test('renders success status with emerald color', () => {
    const container = render(<StatusBadge status="success" />)
    const span = container.querySelector('span')!
    expect(span.textContent).toBe('Success')
    expect(span.className).toContain('emerald')
  })

  test('renders failed status with red color', () => {
    const container = render(<StatusBadge status="failed" />)
    const span = container.querySelector('span')!
    expect(span.textContent).toBe('Failed')
    expect(span.className).toContain('red')
  })
})
