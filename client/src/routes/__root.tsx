import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../context/AuthContext'
import Sidebar, { SidebarDrawer } from '../components/Sidebar'
import { Button } from '../components/ui/button'
import { Menu } from 'lucide-react'
import { useState } from 'react'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AI Assistants Catalog',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppShell>{children}</AppShell>
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          </QueryClientProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 border-b bg-background/95 p-3 backdrop-blur md:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-4" />
            Menu
          </Button>
        </div>
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
