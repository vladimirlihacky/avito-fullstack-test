import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'bun:test'

import RunOutput from '../components/RunOutput'

describe('RunOutput', () => {
  it('truncates long text and can reveal full output', () => {
    const longText = 'abcdefghijABCDEFGHIJ'
    const maxLength = 10
    const expectedTruncated = `${longText.slice(0, maxLength)}…`

    render(<RunOutput text={longText} maxLength={maxLength} />)

    // Truncated view
    expect(screen.getByText(expectedTruncated)).toBeTruthy()

    // Expand
    const showButton = screen.getByRole('button', { name: /Show full/i })
    fireEvent.click(showButton)

    // Full view
    expect(screen.getByText(longText)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Hide full/i })).toBeTruthy()
  })
})
