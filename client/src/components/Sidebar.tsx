import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { X } from 'lucide-react'

function isActivePath(currentPath: string, targetPath: string) {
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

function NavItem({
  to,
  label,
  active,
  onNavigate,
}: {
  to:
    | '/assistants'
    | '/admin/assistants/new'
    | '/runs/my'
    | '/admin/runs'
    | '/admin/categories/new'
  label: string
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`block rounded-md px-3 py-2 text-sm transition ${
        active
          ? 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isAuthenticated) return null

  return (
    <>
      <div className="mb-6">
        <Link to="/assistants" className="text-lg font-semibold tracking-tight">
          AI Assistants
        </Link>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-1 px-3 text-xs uppercase tracking-wide text-muted-foreground">
            Assistants
          </div>
          <div className="space-y-1">
            <NavItem
              to="/assistants"
              label="Catalog"
              active={isActivePath(location.pathname, '/assistants')}
              onNavigate={onNavigate}
            />
            {user?.role === 'admin' && (
              <NavItem
                to="/admin/assistants/new"
                label="Create new"
                active={isActivePath(
                  location.pathname,
                  '/admin/assistants/new',
                )}
                onNavigate={onNavigate}
              />
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 px-3 text-xs uppercase tracking-wide text-muted-foreground">
            Runs
          </div>
          <div className="space-y-1">
            <NavItem
              to="/runs/my"
              label="My runs"
              active={isActivePath(location.pathname, '/runs/my')}
              onNavigate={onNavigate}
            />
            {user?.role === 'admin' && (
              <NavItem
                to="/admin/runs"
                label="All runs"
                active={isActivePath(location.pathname, '/admin/runs')}
                onNavigate={onNavigate}
              />
            )}
          </div>
        </div>

        {user?.role === 'admin' && (
          <div>
            <div className="mb-1 px-3 text-xs uppercase tracking-wide text-muted-foreground">
              Categories
            </div>
            <div className="space-y-1">
              <NavItem
                to="/admin/categories/new"
                label="Create new"
                active={isActivePath(
                  location.pathname,
                  '/admin/categories/new',
                )}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-3 border-t pt-4">
        <div className="px-1">
          <div className="text-sm font-medium">{user?.email}</div>
          <div className="text-xs capitalize text-muted-foreground">
            {user?.role}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout()
              navigate({ to: '/login' })
              onNavigate?.()
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col border-r bg-background/95 p-4">
      <SidebarContent />
    </aside>
  )
}

export function SidebarDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close sidebar"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative z-10 h-full w-[85vw] max-w-80 border-r bg-background p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  )
}
