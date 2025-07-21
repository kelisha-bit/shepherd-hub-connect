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
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <MemberTopBar />
          <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-x-hidden">
            <div className="container mx-auto px-1 sm:px-2 md:px-4 max-w-full lg:max-w-7xl">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}