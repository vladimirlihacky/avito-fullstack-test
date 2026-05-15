import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, mock, afterEach } from 'bun:test'

import Pagination from '../components/Pagination'

afterEach(() => {
  cleanup()
})

describe('Pagination', () => {
  it('disables Previous on first page and calls onPageChange on Next', () => {
    const onPageChange = mock()

    render(
      <Pagination
        page={1}
        pageSize={10}
        total={25}
        onPageChange={onPageChange}
      />,
    )

    const prevButton = screen.getByRole('button', { name: /Previous/i })
    const nextButton = screen.getByRole('button', { name: /Next/i })

    expect((prevButton as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(prevButton)
    expect(onPageChange).not.toHaveBeenCalled()

    fireEvent.click(nextButton)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Next on last page', () => {
    const onPageChange = mock()

    render(
      <Pagination
        page={3}
        pageSize={10}
        total={25}
        onPageChange={onPageChange}
      />,
    )

    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect((nextButton as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(nextButton)
    expect(onPageChange).not.toHaveBeenCalled()
  })
})
