import MainSidebar from "@/components/layout/sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Outlet } from "react-router"

export default function MainLayout() {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 px-4 pt-4 md:px-6 md:pt-6">
          <SidebarTrigger className="md:hidden" />
        </div>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
