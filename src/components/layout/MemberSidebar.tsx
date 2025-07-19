import { NavLink, useLocation } from "react-router-dom";
import { User, Calendar, DollarSign, Bell, Home } from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/member", icon: Home },
  { title: "Profile", url: "/member/profile", icon: User },
  { title: "Attendance", url: "/member/attendance", icon: Calendar },
  { title: "Donations", url: "/member/donations", icon: DollarSign },
  { title: "Events", url: "/member/events", icon: Calendar },
  { title: "Notifications", url: "/member/notifications", icon: Bell, badge: 3 },
];

export function MemberSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="h-screen w-64 bg-[#6C4BC1] flex flex-col justify-between rounded-tl-3xl shadow-xl">
      <div>
        {/* Header */}
        <div className="pt-8 pb-4 px-8">
          <span className="text-white text-2xl font-extrabold tracking-wide">SUCCESS</span>
        </div>
        {/* Profile/Search Bar */}
        <div className="flex items-center gap-2 bg-[#F3F6FA] rounded-full mx-6 px-4 py-2 mb-6 shadow-sm">
          <User className="h-5 w-5 text-[#6C4BC1]" />
          <span className="text-[#6C4BC1] font-semibold text-base">Profile</span>
        </div>
        {/* Menu Card */}
        <div className="bg-[#F3F6FA] rounded-2xl mx-6 py-4 px-2 shadow-md flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = currentPath === item.url;
            return (
              <NavLink
                to={item.url}
                key={item.title}
                className={`flex items-center justify-between px-4 py-2 rounded-xl transition font-medium text-base ${isActive ? 'bg-[#E0D7F3] text-[#6C4BC1]' : 'text-[#6C4BC1] hover:bg-[#E0D7F3]'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${item.badge > 0 ? 'bg-[#6C4BC1] text-white' : 'bg-[#E0D7F3] text-[#6C4BC1]'}`}>{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
      {/* Mascot/Logo at the bottom */}
      <div className="flex flex-col items-center mb-8 mt-4">
        {/* Placeholder for colorful bird mascot */}
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 80C65 80 80 65 80 45C80 25 65 10 45 10C25 10 10 25 10 45C10 65 25 80 45 80Z" fill="#6C4BC1"/>
          <path d="M45 70C60 70 70 60 70 45C70 30 60 20 45 20C30 20 20 30 20 45C20 60 30 70 45 70Z" fill="#3DDC97"/>
          <path d="M45 60C55 60 60 55 60 45C60 35 55 30 45 30C35 30 30 35 30 45C30 55 35 60 45 60Z" fill="#F9C846"/>
          <path d="M45 50C50 50 52 48 52 45C52 42 50 40 45 40C40 40 38 42 38 45C38 48 40 50 45 50Z" fill="#F95738"/>
        </svg>
      </div>
    </aside>
  );
} 