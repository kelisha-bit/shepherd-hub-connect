import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export function MemberTopBar() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitials = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  const userName = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user?.email || "Member";

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{userName}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
} 