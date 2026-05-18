import { describe, expect, test } from 'bun:test'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AssistantCard } from '@/components/assistants/assistant-card'
import type { Assistant } from '@/shared/api/types'

const mockAssistant: Assistant = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  categoryId: 'cat-1',
  categoryName: 'Cooking',
  name: 'Chef Bot',
  description: 'Creates delicious recipes from ingredients',
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a chef',
  exampleUserPrompt: 'chicken, rice, tomatoes',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: null,
}

function renderWithRouter(el: React.ReactElement) {
  const router = createMemoryRouter([
    {
      path: '/',
      element: el,
    },
    {
      path: '/assistants/:id',
      element: <div>Detail page</div>,
    },
  ])
  const container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    createRoot(container).render(<RouterProvider router={router} />)
  })
  return container
}

describe('AssistantCard', () => {
  test('renders assistant name, description, category and model', () => {
    const container = renderWithRouter(<AssistantCard assistant={mockAssistant} />)

    expect(container.textContent).toContain('Chef Bot')
    expect(container.textContent).toContain('Creates delicious recipes from ingredients')
    expect(container.textContent).toContain('Cooking')
    expect(container.textContent).toContain('gpt-4o-mini')
  })

  test('renders inactive badge for inactive assistant', () => {
    const inactive = { ...mockAssistant, isActive: false }
    const container = renderWithRouter(<AssistantCard assistant={inactive} />)

    expect(container.textContent).toContain('Inactive')
  })

  test('links to assistant detail page', () => {
    const container = renderWithRouter(<AssistantCard assistant={mockAssistant} />)

    const link = container.querySelector('a')!
    expect(link.getAttribute('href')).toBe(`/assistants/${mockAssistant.id}`)
  })
})
