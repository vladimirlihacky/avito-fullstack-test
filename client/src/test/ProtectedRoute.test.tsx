import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, mock, beforeEach } from 'bun:test'

import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'

mock.module("@tanstack/react-router", () => {
  return {
    useNavigate: () => mock(), 
  };
});
describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('does not render children when user is not authenticated', () => {
    render(
      <AuthProvider>
        <ProtectedRoute requiredRole="admin">
          <div>child</div>
        </ProtectedRoute>
      </AuthProvider>,
    )

    expect(screen.queryByText('child')).toBeNull()
  })

  it('does not render children when role mismatches', async () => {
    sessionStorage.setItem('auth_token', 'token')
    sessionStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: '1',
        email: 'user@test.com',
        role: 'user',
        createdAt: null,
      }),
    )

    render(
      <AuthProvider>
        <ProtectedRoute requiredRole="admin">
          <div>child</div>
        </ProtectedRoute>
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.queryByText('child')).toBeNull())
  })

  it('renders children when role matches', async () => {
    sessionStorage.setItem('auth_token', 'token')
    sessionStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        role: 'admin',
        createdAt: null,
      }),
    )

    render(
      <AuthProvider>
        <ProtectedRoute requiredRole="admin">
          <div>child</div>
        </ProtectedRoute>
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.queryByText('child')).not.toBeNull())
  })
})
