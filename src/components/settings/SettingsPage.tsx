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
import { Save, User, Bell, Shield, Database, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types for better type safety
interface Profile {
  first_name: string;
  last_name: string;
  phone: string;
  role?: string;
}

interface ChurchSettings {
  id?: string;
  church_name: string;
  church_address: string;
  church_phone: string;
  church_email: string;
  church_website: string;
  service_times: string;
}

interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  event_reminders: boolean;
  donation_alerts: boolean;
}

export function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [churchLoading, setChurchLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const [churchSettings, setChurchSettings] = useState<ChurchSettings>({
    church_name: "Your Church Name",
    church_address: "",
    church_phone: "",
    church_email: "",
    church_website: "",
    service_times: "",
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_notifications: true,
    sms_notifications: false,
    event_reminders: true,
    donation_alerts: true,
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchProfile(),
        fetchChurchSettings(),
        fetchNotificationPreferences()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

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
          role: data.role || "member",
        });
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  };

  const fetchChurchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("church_settings")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setChurchSettings({
          id: data.id,
          church_name: data.church_name || "Your Church Name",
          church_address: data.church_address || "",
          church_phone: data.church_phone || "",
          church_email: data.church_email || "",
          church_website: data.church_website || "",
          service_times: data.service_times || "",
        });
      }
    } catch (error) {
      console.error("Error fetching church settings:", error);
      throw error;
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setNotifications({
          id: data.id,
          user_id: data.user_id,
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false,
          event_reminders: data.event_reminders ?? true,
          donation_alerts: data.donation_alerts ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      throw error;
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const saveChurchSettings = async () => {
    if (!user || !isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can update church settings",
        variant: "destructive",
      });
      return;
    }

    setChurchLoading(true);
    try {
      const settingsData = {
        church_name: churchSettings.church_name,
        church_address: churchSettings.church_address,
        church_phone: churchSettings.church_phone,
        church_email: churchSettings.church_email,
        church_website: churchSettings.church_website,
        service_times: churchSettings.service_times,
      };

      let error;
      if (churchSettings.id) {
        // Update existing settings
        ({ error } = await supabase
          .from("church_settings")
          .update(settingsData)
          .eq("id", churchSettings.id));
      } else {
        // Insert new settings
        ({ error } = await supabase
          .from("church_settings")
          .insert(settingsData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: "Church settings updated successfully",
      });

      // Refresh church settings to get the ID if it was an insert
      await fetchChurchSettings();
    } catch (error) {
      console.error('Error updating church settings:', error);
      toast({
        title: "Error",
        description: "Failed to update church settings",
        variant: "destructive",
      });
    } finally {
      setChurchLoading(false);
    }
  };

  const saveNotifications = async () => {
    if (!user) return;

    setNotificationLoading(true);
    try {
      const notificationData = {
        user_id: user.id,
        email_notifications: notifications.email_notifications,
        sms_notifications: notifications.sms_notifications,
        event_reminders: notifications.event_reminders,
        donation_alerts: notifications.donation_alerts,
      };

      let error;
      if (notifications.id) {
        // Update existing preferences
        ({ error } = await supabase
          .from("notification_preferences")
          .update(notificationData)
          .eq("id", notifications.id));
      } else {
        // Insert new preferences
        ({ error } = await supabase
          .from("notification_preferences")
          .insert(notificationData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      });

      // Refresh notification preferences to get the ID if it was an insert
      await fetchNotificationPreferences();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and church preferences
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

          <Button onClick={saveProfile} disabled={profileLoading}>
            {profileLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {profileLoading ? "Saving..." : "Save Profile"}
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

          <Button onClick={saveChurchSettings} disabled={churchLoading || !isAdmin}>
            {churchLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {churchLoading ? "Saving..." : "Save Church Information"}
          </Button>
          {!isAdmin && (
            <p className="text-sm text-muted-foreground mt-2">
              Only administrators can update church settings
            </p>
          )}
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

          <Button onClick={saveNotifications} disabled={notificationLoading}>
            {notificationLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {notificationLoading ? "Saving..." : "Save Preferences"}
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