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
import { Plus, Edit, Trash2, Send, Eye, Calendar, Users, AlertCircle, Info, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Announcement {
  id: string;
  subject: string;
  message: string;
  communication_type: string;
  target_audience: string;
  status: string;
  priority: string;
  category: string;
  expires_at?: string;
  sent_date?: string;
  created_at: string;
  updated_at: string;
}

interface AnnouncementForm {
  subject: string;
  message: string;
  target_audience: string;
  priority: string;
  category: string;
  expires_at?: string;
  send_immediately: boolean;
}

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementForm>({
    subject: "",
    message: "",
    target_audience: "all_members",
    priority: "normal",
    category: "general",
    send_immediately: false,
  });
  const { toast } = useToast();

  const categories = [
    { value: "general", label: "General", icon: Info },
    { value: "urgent", label: "Urgent", icon: AlertCircle },
    { value: "event", label: "Event", icon: Calendar },
    { value: "service", label: "Service", icon: CheckCircle },
    { value: "prayer", label: "Prayer", icon: Users },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-500" },
    { value: "normal", label: "Normal", color: "bg-blue-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "urgent", label: "Urgent", color: "bg-red-500" },
  ];

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
    
    try {
      // Create base announcement data compatible with existing database structure
      const announcementData = {
        subject: formData.subject,
        message: formData.message,
        communication_type: "announcement",
        target_audience: formData.target_audience,
        status: formData.send_immediately ? "sent" : "draft",
        sent_date: formData.send_immediately ? new Date().toISOString() : null,
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from("communications")
          .update(announcementData)
          .eq("id", editingAnnouncement.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("communications")
          .insert([announcementData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: formData.send_immediately 
            ? "Announcement created and sent successfully" 
            : "Announcement created as draft",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
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
      priority: "normal",
      category: "general",
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
      priority: "normal", // Default since field may not exist yet
      category: "general", // Default since field may not exist yet
      expires_at: "", // Default since field may not exist yet
      send_immediately: false,
    });
    setIsDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    const p = priorities.find(p => p.value === priority);
    return p?.color || "bg-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    const Icon = cat?.icon || Info;
    return <Icon className="h-4 w-4" />;
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

              <div>
                <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? "Update" : formData.send_immediately ? "Create & Send" : "Save Draft"}
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
                      {announcement.category && getCategoryIcon(announcement.category)}
                      {announcement.subject}
                      {announcement.priority === 'urgent' && (
                        <Badge variant="destructive" className="ml-2">URGENT</Badge>
                      )}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={announcement.status === "sent" ? "default" : "secondary"}>
                        {announcement.status}
                      </Badge>
                      <Badge variant="outline">{announcement.target_audience}</Badge>
                      {announcement.priority && announcement.priority !== 'normal' && (
                        <div className={`px-2 py-1 rounded-full text-xs text-white ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </div>
                      )}
                      {announcement.expires_at && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expires: {format(new Date(announcement.expires_at), "MMM dd, yyyy")}
                        </Badge>
                      )}
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
