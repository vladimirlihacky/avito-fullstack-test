import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import { Button } from '#/components/ui/button'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  if (!isAuthenticated) {
    return null
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/assistants" className="text-xl font-bold">
              AI Assistants
            </Link>

            <nav className="flex items-center gap-4">
              <Link
                to="/assistants"
                className={`text-sm font-medium transition-colors ${
                  isActive('/assistants')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Catalog
              </Link>

              <Link
                to="/runs/my"
                className={`text-sm font-medium transition-colors ${
                  isActive('/runs/my')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Runs
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/categories/new"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/admin/categories/new')
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    New Category
                  </Link>

                  <Link
                    to="/admin/assistants/new"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/admin/assistants/new')
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    New Assistant
                  </Link>

                  <Link
                    to="/admin/runs"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/admin/runs')
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Runs
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user?.email}</p>
              <p className="text-muted-foreground text-xs capitalize">
                {user?.role}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
