import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Bell } from "lucide-react";

interface Communication {
  id: string;
  subject: string;
  message: string;
  communication_type: string;
  target_audience: string;
  status: string;
  sent_date?: string;
  created_at: string;
}

export default function MemberNotificationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("status", "sent")
        .or("target_audience.eq.all,target_audience.eq.members")
        .order("sent_date", { ascending: false });
      
      if (error) {
        console.error("Error fetching communications:", error);
        setCommunications([]);
      } else {
        setCommunications(data || []);
      }
    } catch (error) {
      console.error("Error fetching communications:", error);
      setCommunications([]);
    }
    
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with church announcements and messages</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading notifications...</div>
      ) : communications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {communications.map((comm) => (
            <Card key={comm.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{comm.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(comm.communication_type)}
                    <Badge variant={getTypeVariant(comm.communication_type)}>
                      {comm.communication_type}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{comm.target_audience}</Badge>
                  {comm.sent_date && (
                    <span className="text-sm text-muted-foreground">
                      Sent: {new Date(comm.sent_date).toLocaleDateString()}
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