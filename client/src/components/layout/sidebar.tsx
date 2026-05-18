import { useUnit } from 'effector-react'
import { $authUser, $isAdmin, logoutEvent } from '@/shared/api/model'
import { useTheme } from '@/components/shared/use-theme'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Link, useLocation } from 'react-router'
import { BotIcon, LogOutIcon, MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

function isActiveUrl(pathname: string, url: string) {
  if (url === '/assistants') {
    return pathname === '/assistants' || pathname === '/'
  }
  return pathname.startsWith(url)
}

export default function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const isAdmin = useUnit($isAdmin)
  const user = useUnit($authUser)
  const handleLogout = useUnit(logoutEvent)
  const { theme, toggle: toggleTheme } = useTheme()
  const { pathname } = useLocation()

  const userItems = [
    { title: 'Assistants', url: '/assistants' },
    { title: 'My Runs', url: '/runs/my' },
  ]

  const adminItems = [
    { title: 'New Category', url: '/admin/categories/new' },
    { title: 'New Assistant', url: '/admin/assistants/new' },
    { title: 'All Runs', url: '/admin/runs' },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/assistants">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <BotIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">AI Assistants</span>
                  <span className="text-xs text-muted-foreground">Catalog</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {userItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={isActiveUrl(pathname, item.url)}
                >
                  <Link to={item.url}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveUrl(pathname, item.url)}
                  >
                    <Link to={item.url}>{item.title}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{user.email}</p>
            <p className="text-[10px] text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <SunIcon className="size-4" />
              ) : (
                <MoonIcon className="size-4" />
              )}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => handleLogout()}
            >
              <LogOutIcon className="size-4" />
              Log out
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
