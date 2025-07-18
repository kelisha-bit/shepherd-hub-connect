import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MemberProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("email", user?.email)
      .single();
    if (error) {
      toast({ title: "Error", description: "Could not fetch profile", variant: "destructive" });
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("members")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        group: profile.group,
        date_of_birth: profile.date_of_birth,
        address: profile.address,
      })
      .eq("id", profile.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile updated successfully" });
      setEdit(false);
    }
    setLoading(false);
  };

  if (loading && !profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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