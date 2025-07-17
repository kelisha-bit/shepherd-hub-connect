import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Save, User, Bell, Shield, Database } from "lucide-react";

export function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  
  const [churchSettings, setChurchSettings] = useState({
    church_name: "Your Church Name",
    church_address: "",
    church_phone: "",
    church_email: "",
    church_website: "",
    service_times: "",
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    event_reminders: true,
    donation_alerts: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and church preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                placeholder="Enter your first name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>
          
          <Button onClick={saveProfile} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Church Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Church Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="church_name">Church Name</Label>
            <Input
              id="church_name"
              value={churchSettings.church_name}
              onChange={(e) => setChurchSettings({ ...churchSettings, church_name: e.target.value })}
              placeholder="Enter church name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="church_address">Address</Label>
            <Textarea
              id="church_address"
              value={churchSettings.church_address}
              onChange={(e) => setChurchSettings({ ...churchSettings, church_address: e.target.value })}
              placeholder="Enter church address"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="church_phone">Phone</Label>
              <Input
                id="church_phone"
                value={churchSettings.church_phone}
                onChange={(e) => setChurchSettings({ ...churchSettings, church_phone: e.target.value })}
                placeholder="Church phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="church_email">Email</Label>
              <Input
                id="church_email"
                type="email"
                value={churchSettings.church_email}
                onChange={(e) => setChurchSettings({ ...churchSettings, church_email: e.target.value })}
                placeholder="Church email address"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service_times">Service Times</Label>
            <Textarea
              id="service_times"
              value={churchSettings.service_times}
              onChange={(e) => setChurchSettings({ ...churchSettings, service_times: e.target.value })}
              placeholder="Sunday 9:00 AM, 11:00 AM, Wednesday 7:00 PM"
            />
          </div>
          
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Church Information
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notifications.email_notifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, email_notifications: checked })
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              checked={notifications.sms_notifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, sms_notifications: checked })
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Event Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders for upcoming events
              </p>
            </div>
            <Switch
              checked={notifications.event_reminders}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, event_reminders: checked })
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Donation Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for new donations
              </p>
            </div>
            <Switch
              checked={notifications.donation_alerts}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, donation_alerts: checked })
              }
            />
          </div>
          
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Change Password</Label>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
            <Button variant="outline">
              Change Password
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
            <Button variant="outline">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}