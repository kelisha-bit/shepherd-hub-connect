import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Bell, Calendar, Users, AlertCircle, Info, CheckCircle, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Communication {
  id: string;
  subject: string;
  message: string;
  communication_type: string;
  target_audience: string;
  status: string;
  priority?: string;
  category?: string;
  expires_at?: string;
  sent_date?: string;
  created_at: string;
}

export default function MemberNotificationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [filteredCommunications, setFilteredCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchCommunications();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('communications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'communications'
      }, () => {
        fetchCommunications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterCommunications();
  }, [communications, categoryFilter]);

  const fetchCommunications = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("status", "sent")
        .or("target_audience.eq.all_members,target_audience.eq.members,target_audience.eq.all")
        .order("sent_date", { ascending: false });
      
      if (error) {
        console.error("Error fetching communications:", error);
        setCommunications([]);
      } else {
        // Filter out expired announcements (only if expires_at field exists)
        const activeAnnouncements = (data || []).filter(comm => {
          if (!comm.expires_at) return true;
          return new Date(comm.expires_at) > new Date();
        });
        setCommunications(activeAnnouncements);
      }
    } catch (error) {
      console.error("Error fetching communications:", error);
      setCommunications([]);
    }
    
    setLoading(false);
  };

  const filterCommunications = () => {
    let filtered = communications;

    // Filter by communication type instead of category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(comm => comm.communication_type === categoryFilter);
    }

    // Simple sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.sent_date || b.created_at).getTime() - new Date(a.sent_date || a.created_at).getTime();
    });

    setFilteredCommunications(filtered);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "urgent":
        return <AlertCircle className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "service":
        return <CheckCircle className="h-4 w-4" />;
      case "prayer":
        return <Users className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      default:
        return "secondary";
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "email":
        return "default";
      case "sms":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications & Announcements</h1>
          <p className="text-muted-foreground">Stay updated with church announcements and messages</p>
        </div>
        <Button onClick={fetchCommunications} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Simple filter for communication type */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by type:</span>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>

        {categoryFilter !== "all" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCategoryFilter("all")}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading notifications...</div>
      ) : filteredCommunications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {communications.length === 0 ? "No notifications found." : "No notifications match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCommunications.map((comm) => (
            <Card key={comm.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getTypeIcon(comm.communication_type)}
                      {comm.subject}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(comm.communication_type)}
                    <Badge variant={getTypeVariant(comm.communication_type)}>
                      {comm.communication_type}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{comm.target_audience}</Badge>
                  <Badge variant={getTypeVariant(comm.communication_type)}>
                    {comm.communication_type}
                  </Badge>
                  {comm.sent_date && (
                    <span className="text-sm text-muted-foreground">
                      Sent: {format(new Date(comm.sent_date), "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-muted p-4 rounded-lg">
                  {comm.message}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 