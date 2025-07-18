import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MemberSidebar } from "./MemberSidebar";
import { MemberTopBar } from "./MemberTopBar";
import { Outlet } from "react-router-dom";

interface MemberPortalLayoutProps {
  children?: ReactNode;
}

export default function MemberPortalLayout({ children }: MemberPortalLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <MemberSidebar />
        <div className="flex-1 flex flex-col">
          <MemberTopBar />
          <main className="flex-1 p-4 md:p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 