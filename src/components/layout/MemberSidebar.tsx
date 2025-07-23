import { NavLink, useLocation } from "react-router-dom";
import { User, Calendar, DollarSign, Bell, Home, Church, Palette, MessageSquare, BookOpen, HandHeart, Users, Bookmark } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/member", icon: Home },
  { title: "Profile", url: "/member/profile", icon: User },
  { title: "Attendance", url: "/member/attendance", icon: Calendar },
  { title: "Donations", url: "/member/donations", icon: DollarSign },
  { title: "Events", url: "/member/events", icon: Calendar },
  { title: "Communications", url: "/member/communications", icon: MessageSquare },
  { title: "Resources", url: "/member/resources", icon: Bookmark },
  { title: "Sermons", url: "/member/sermons", icon: BookOpen },
  { title: "Prayer Requests", url: "/member/prayer-requests", icon: HandHeart },
  { title: "Small Groups", url: "/member/small-groups", icon: Users },
  { title: "Notifications", url: "/member/notifications", icon: Bell, badge: 3 },
];

export function MemberSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Church className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-foreground">Member Portal</h2>
              <p className="text-xs text-muted-foreground">Welcome back!</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}