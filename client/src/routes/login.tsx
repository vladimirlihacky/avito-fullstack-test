import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import type { AuthUser, UserRole } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDummyLogin, useLogin, useRegister } from '@/api/hooks'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

type AuthMode = 'dummy' | 'login' | 'register'

function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('dummy')
  const [role, setRole] = useState<UserRole>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const dummyLoginMutation = useDummyLogin()
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const token =
        mode === 'dummy'
          ? await dummyLoginMutation.mutateAsync({ role })
          : mode === 'login'
            ? await loginMutation.mutateAsync({
                email: email.trim(),
                password,
              })
            : await registerMutation.mutateAsync({
                email: email.trim(),
                password,
              })

      const authUser: AuthUser = {
        id: token.user.id,
        email: token.user.email,
        role: token.user.role,
        createdAt: token.user.createdAt ?? undefined,
      }

      login(authUser, token.token)
      navigate({ to: '/assistants' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const mutationPending =
    isLoading ||
    dummyLoginMutation.isPending ||
    loginMutation.isPending ||
    registerMutation.isPending

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="flex gap-2 rounded-md border p-1">
              <Button
                type="button"
                variant={mode === 'dummy' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setMode('dummy')}
              >
                Dummy login
              </Button>
              <Button
                type="button"
                variant={mode === 'login' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setMode('login')}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={mode === 'register' ? 'default' : 'ghost'}
                className="flex-1"
                onClick={() => setMode('register')}
              >
                Register
              </Button>
            </div>

            {mode === 'dummy' ? (
              <div className="space-y-2">
                <Label>Select role</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={role === 'admin' ? 'default' : 'outline'}
                    onClick={() => setRole('admin')}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'user' ? 'default' : 'outline'}
                    onClick={() => setRole('user')}
                  >
                    User
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={mutationPending} className="w-full">
              {mutationPending
                ? 'Please wait...'
                : mode === 'dummy'
                  ? 'Continue with dummy role'
                  : mode === 'login'
                    ? 'Login'
                    : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
