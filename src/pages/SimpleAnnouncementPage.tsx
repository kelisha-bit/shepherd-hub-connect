import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { Plus, Edit, Trash2, Send, Bell, MessageSquare, Mail } from "lucide-react";
import { format } from "date-fns";

interface Announcement {
  id: string;
  subject: string;
  message: string;
  communication_type: string;
  target_audience: string;
  status: string;
  sent_date?: string;
  created_at: string;
  updated_at: string;
}

interface AnnouncementForm {
  subject: string;
  message: string;
  target_audience: string;
  send_immediately: boolean;
}

export default function SimpleAnnouncementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementForm>({
    subject: "",
    message: "",
    target_audience: "all_members",
    send_immediately: false,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const targetAudiences = [
    { value: "all_members", label: "All Members" },
    { value: "members", label: "Members Only" },
    { value: "leaders", label: "Leaders Only" },
    { value: "volunteers", label: "Volunteers" },
    { value: "youth", label: "Youth Group" },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return; // Prevent double submission
    
    // Add form validation
    if (!formData.subject.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Message is required",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create announcements",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Form submission started with data:', formData);
    console.log('Current user:', user);
    setSubmitting(true);
    
    try {
      const announcementData = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        communication_type: "announcement",
        target_audience: formData.target_audience,
        status: formData.send_immediately ? "sent" : "draft",
        sent_date: formData.send_immediately ? new Date().toISOString() : null,
        sent_by: user?.id || null,
      };

      console.log('Sending data to Supabase:', announcementData);

      if (editingAnnouncement) {
        console.log('Updating existing announcement:', editingAnnouncement.id);
        const { data, error } = await supabase
          .from("communications")
          .update(announcementData)
          .eq("id", editingAnnouncement.id)
          .select();

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        console.log('Update successful:', data);
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        console.log('Creating new announcement');
        
        // First, let's test if we can connect to the table
        console.log('Testing table access...');
        const { data: testData, error: testError } = await supabase
          .from("communications")
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('Table access test failed:', testError);
          throw new Error(`Cannot access communications table: ${testError.message}`);
        }
        console.log('Table access test passed:', testData);
        
        // Now try the insert
        const { data, error } = await supabase
          .from("communications")
          .insert([announcementData])
          .select();

        if (error) {
          console.error('Supabase insert error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.error('Insert returned no data');
          throw new Error('Insert operation completed but returned no data');
        }
        
        console.log('Insert successful:', data);
        toast({
          title: "Success",
          description: formData.send_immediately 
            ? "Announcement created and sent successfully" 
            : "Announcement created as draft",
        });
      }

      console.log('Resetting form and closing dialog');
      resetForm();
      setIsDialogOpen(false);
      await fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      
      // More detailed error message
      let errorMessage = "Failed to save announcement";
      let errorDetails = "";
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = `Failed to save announcement: ${error.message}`;
        }
        if ('details' in error && error.details) {
          errorDetails = ` Details: ${error.details}`;
        }
        if ('hint' in error && error.hint) {
          errorDetails += ` Hint: ${error.hint}`;
        }
        if ('code' in error && error.code) {
          errorDetails += ` Code: ${error.code}`;
        }
      }
      
      console.error('Full error details:', {
        error,
        message: errorMessage,
        details: errorDetails,
        formData,
        announcementData: {
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          communication_type: "announcement",
          target_audience: formData.target_audience,
          status: formData.send_immediately ? "sent" : "draft",
          sent_date: formData.send_immediately ? new Date().toISOString() : null,
          sent_by: user?.id || null,
        }
      });
      
      toast({
        title: "Error",
        description: errorMessage + errorDetails,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from("communications")
        .update({
          status: "sent",
          sent_date: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Announcement sent successfully",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast({
        title: "Error",
        description: "Failed to send announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("communications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      message: "",
      target_audience: "all_members",
      send_immediately: false,
    });
    setEditingAnnouncement(null);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      subject: announcement.subject,
      message: announcement.message,
      target_audience: announcement.target_audience,
      send_immediately: false,
    });
    setIsDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "announcement":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Announcement Management</h1>
          <p className="text-muted-foreground">Create and manage church announcements</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
              </DialogTitle>
              <DialogDescription>
                {editingAnnouncement ? "Update the announcement details below." : "Fill in the details to create a new announcement for your church members."}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter announcement subject"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter announcement message"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAudiences.map((audience) => (
                      <SelectItem key={audience.value} value={audience.value}>
                        {audience.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!editingAnnouncement && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="send_immediately"
                    checked={formData.send_immediately}
                    onCheckedChange={(checked) => setFormData({ ...formData, send_immediately: checked })}
                  />
                  <Label htmlFor="send_immediately">Send immediately</Label>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingAnnouncement ? "Update" : formData.send_immediately ? "Create & Send" : "Save Draft"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No announcements found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getTypeIcon(announcement.communication_type)}
                      {announcement.subject}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={announcement.status === "sent" ? "default" : "secondary"}>
                        {announcement.status}
                      </Badge>
                      <Badge variant="outline">{announcement.target_audience}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {announcement.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => handleSendAnnouncement(announcement.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Created: {format(new Date(announcement.created_at), "MMM dd, yyyy 'at' h:mm a")}
                  {announcement.sent_date && (
                    <span className="ml-4">
                      Sent: {format(new Date(announcement.sent_date), "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="text-sm bg-muted p-4 rounded-lg">
                  {announcement.message}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
