import { useUnit } from 'effector-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { authModel } from '@/shared/api/model'
import { cn } from '@/shared/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'

export default function RegisterForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = authModel
  const pending = useUnit(register.$pending)
  const error = useUnit(register.$error)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from =
    (location.state as { from?: Location })?.from?.pathname ?? '/assistants'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    register.fx({ email, password }).then(() => {
      navigate(from, { replace: true })
    })
  }

  return (
    <div className={cn('flex flex-col gap-6')}>
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="*****_"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              {error && (
                <p className="text-sm text-destructive">{error.message}</p>
              )}
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Registering...' : 'Register'}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Already have an account?
              </FieldSeparator>
              <Field className="flex-row">
                <Link to="/login" className="w-full">
                  <Button type="button" variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/dummyLogin" className="w-full">
                  <Button type="button" variant="outline" className="w-full">
                    Dummy login
                  </Button>
                </Link>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
