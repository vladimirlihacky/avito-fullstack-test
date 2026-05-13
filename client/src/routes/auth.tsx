import { useDummyLogin } from '#/api'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()
  const login = useDummyLogin()
  login.mutate({ role: "admin" })

  return (
    <div>
      <h2>Success!</h2>
      <pre>
      </pre>
    </div>
  )
}
