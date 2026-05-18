import { useUnit } from 'effector-react'
import { Link, useNavigate, useLocation } from 'react-router'
import { authModel } from '@/shared/api/model'
import type { Role } from '@/shared/api/types'
import { cn } from '@/shared/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldSeparator } from '@/components/ui/field'

export default function DummyLoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const pending = useUnit(authModel.dummyLogin.$pending)
  const error = useUnit(authModel.dummyLogin.$error)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/assistants'

  const handleLogin = (role: Role) => {
    authModel.dummyLogin.fx({ role }).then(() => {
      navigate(from, { replace: true })
    })
  }

  return (
    <div className={cn('flex flex-col gap-6')}>
      <Card>
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
          <CardDescription>Choose a role to get a test token</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Button
                type="button"
                variant="default"
                className="w-full"
                disabled={pending}
                onClick={() => handleLogin('admin')}
              >
                Login as Admin
              </Button>
            </Field>
            <Field>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={pending}
                onClick={() => handleLogin('user')}
              >
                Login as User
              </Button>
            </Field>
            {pending && <p className="text-sm text-muted-foreground text-center">Logging in...</p>}
            {error && <p className="text-sm text-destructive">{error.message}</p>}
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Or use
            </FieldSeparator>
            <Field className="flex-row">
              <Link to="/login" className="w-full">
                <Button type="button" variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button type="button" variant="outline" className="w-full">
                  Register
                </Button>
              </Link>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
