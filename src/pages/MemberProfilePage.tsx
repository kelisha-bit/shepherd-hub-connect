import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";

export default function MemberProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("User in MemberProfilePage:", user);
    if (user) fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    
    // Try to find member by email first
    let { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("email", user?.email)
      .maybeSingle();
    
    console.log("Profile fetch result:", { data, error });
    
    // If not found by email, try by auth ID
    if (!data) {
      const { data: idData, error: idError } = await supabase
        .from("members")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      
      if (idData) {
        data = idData;
        error = idError;
      }
    }
    
    // If still no profile, create one
    if (!data && user) {
      console.log("Creating new member profile...");
      const { data: newProfile, error: createError } = await supabase
        .from("members")
        .insert([{
          id: user.id,
          email: user.email || "",
          first_name: user.user_metadata?.first_name || "New",
          last_name: user.user_metadata?.last_name || "Member",
          avatar_url: user.user_metadata?.avatar_url || null
        }])
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating profile:", createError);
        toast({ title: "Error", description: "Could not create profile", variant: "destructive" });
      } else {
        data = newProfile;
        toast({ title: "Welcome!", description: "Your member profile has been created", variant: "default" });
      }
    }
    
    if (data) {
      setProfile(data);
    } else if (error) {
      toast({ title: "Error", description: "Could not fetch profile", variant: "destructive" });
    }
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("members")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
          group: profile.group,
          date_of_birth: profile.date_of_birth,
          address: profile.address,
          profile_image_url: profile.profile_image_url  // Only update profile_image_url
        })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      // Also update the auth user's metadata
      if (user) {
        await supabase.auth.updateUser({
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.profile_image_url  // Store in auth metadata as avatar_url
          }
        });
      }
      
      toast({ title: "Success", description: "Profile updated successfully" });
      setEdit(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
    
    setLoading(false);
  };

  const ensureBucketExists = async () => {
    try {
      const bucketName = 'profile-pictures';
      
      // Try to get bucket info - if it fails, bucket doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
      
      if (bucketError) {
        // Check if error is due to bucket not existing
        if (bucketError.message.includes('not found')) {
          console.log('Creating profile-images bucket...');
          // Bucket doesn't exist, create it
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (createError) {
            console.error('Error creating bucket:', createError);
            // Instead of throwing error, return false to indicate failure
            return false;
          }
          console.log('Profile images bucket created successfully');
        } else {
          // Other error with bucket check
          console.error('Error checking bucket:', bucketError);
          return false;
        }
      } else {
        console.log('Profile images bucket already exists');
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      
      // Ensure bucket exists
      const bucketExists = await ensureBucketExists();
      if (!bucketExists) {
        toast({
          title: "Storage error",
          description: "Could not access or create storage bucket. Please try again later.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        
        // Provide more specific error messages based on error type
        if (uploadError.message.includes('permission')) {
          toast({
            title: "Permission denied",
            description: "You don't have permission to upload files. Please contact support.",
            variant: "destructive"
          });
        } else if (uploadError.message.includes('size')) {
          toast({
            title: "File too large",
            description: "The file exceeds the maximum allowed size.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Upload failed",
            description: uploadError.message || "Failed to upload profile picture",
            variant: "destructive"
          });
        }
        
        setUploading(false);
        return;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);
      
      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('members')
        .update({ 
          profile_image_url: publicUrl  // Only update profile_image_url field
        })
        .eq('id', profile.id);
        
      if (updateError) {
        console.error('Error updating profile with new avatar:', updateError);
        toast({
          title: "Update failed",
          description: "Image uploaded but failed to update profile. Please try again.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      
      // Also update the auth user's metadata
      if (user) {
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });
      }
      
      // Update local state
      setProfile({ 
        ...profile, 
        profile_image_url: publicUrl  // Only update profile_image_url in local state
      });
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading && !profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      Profile not found. Please contact support or try logging out and in again.
    </div>
  );

  // Get user initials for avatar fallback
  const userInitials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-2 border-primary">
                <AvatarImage 
                  src={profile?.profile_image_url || user?.user_metadata?.avatar_url} 
                  alt={`${profile?.first_name} ${profile?.last_name}`}
                  onError={() => console.log("Avatar image failed to load in profile page")}
                />
                <AvatarFallback className="text-4xl bg-primary/10">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {edit && (
                <>
                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                  />
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {uploading ? 'Uploading...' : 'Click the camera icon to change your profile picture'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={profile.first_name || ""}
                onChange={handleChange}
                disabled={!edit}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={profile.last_name || ""}
                onChange={handleChange}
                disabled={!edit}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={profile.phone_number || ""}
                onChange={handleChange}
                disabled={!edit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Group Affiliation</Label>
              <Input
                id="group"
                name="group"
                value={profile.group || ""}
                onChange={handleChange}
                disabled={!edit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Birthday</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={profile.date_of_birth || ""}
                onChange={handleChange}
                disabled={!edit}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                disabled={!edit}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {edit ? (
              <>
                <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                <Button variant="outline" onClick={() => setEdit(false)} disabled={loading}>Cancel</Button>
              </>
            ) : (
              <Button onClick={() => setEdit(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 