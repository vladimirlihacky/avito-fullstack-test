import MainSidebar from "@/components/layout/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function MainLayout() {
    return (
        <div>
            <SidebarProvider>
                <MainSidebar />
                <SidebarInset>
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
            <Outlet />
        </div>
    )
}