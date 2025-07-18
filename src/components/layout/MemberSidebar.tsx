import { NavLink, useLocation } from "react-router-dom";
import { User, Calendar, DollarSign, Bell, Home, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from "@/components/ui/sidebar";

const memberMenuItems = [
  { title: "Dashboard", url: "/member", icon: Home },
  { title: "Profile", url: "/member/profile", icon: User },
  { title: "Attendance", url: "/member/attendance", icon: Calendar },
  { title: "Donations", url: "/member/donations", icon: DollarSign },
  { title: "Events", url: "/member/events", icon: Calendar },
  { title: "Notifications", url: "/member/notifications", icon: Bell },
];

export function MemberSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50";

  return (
    <Sidebar className="w-16 md:w-56" collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="hidden md:block font-semibold text-foreground">Member Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {memberMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end className={getNavClass}>
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
} 