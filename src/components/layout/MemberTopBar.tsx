import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function MemberTopBar() {
  const { user, signOut } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchProfileImage();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileImage = async () => {
    try {
      setLoading(true);
      console.log("MemberTopBar: Fetching profile image for user:", user?.email);
      
      // Only select profile_image_url since avatar_url doesn't exist in the members table
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("profile_image_url")
        .eq("email", user?.email)
        .maybeSingle();
      
      console.log("MemberTopBar: Profile data:", memberData);
      console.log("MemberTopBar: Member error:", memberError);
      
      if (!memberError && memberData) {
        // Use profile_image_url from database
        const imageUrl = memberData.profile_image_url || null;
        console.log("MemberTopBar: Setting profile image URL:", imageUrl);
        setProfileImageUrl(imageUrl);
      } else {
        console.log("MemberTopBar: No profile data found, using fallbacks");
        setProfileImageUrl(null);
      }
    } catch (error) {
      console.error("MemberTopBar: Error fetching profile image:", error);
      setProfileImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitials = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  const userName = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user?.email || "Member";

  // Determine the best avatar URL to use
  const avatarUrl = profileImageUrl || 
                   user?.user_metadata?.avatar_url || 
                   user?.user_metadata?.picture;

  // Only log when avatar URL changes
  useEffect(() => {
    if (avatarUrl) {
      console.log("MemberTopBar: Using avatar URL:", avatarUrl);
    }
  }, [avatarUrl]);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 md:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger />
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={avatarUrl || undefined} 
            alt={userName}
            onError={() => console.log("Avatar image failed to load:", avatarUrl)}
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:inline-block">{userName}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
} 