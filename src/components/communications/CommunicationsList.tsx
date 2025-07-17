import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, MessageSquare, Send, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export function CommunicationsList() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch communications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunications = communications.filter((comm) =>
    comm.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const draftCount = communications.filter(comm => comm.status === "draft").length;
  const sentCount = communications.filter(comm => comm.status === "sent").length;

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "sent":
        return "default";
      case "draft":
        return "secondary";
      case "scheduled":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return <div className="p-6">Loading communications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Communications</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCommunications.map((comm) => (
          <Card key={comm.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{comm.subject}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(comm.communication_type)}
                  <Badge variant={getStatusVariant(comm.status)}>
                    {comm.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{comm.communication_type}</Badge>
                <Badge variant="secondary">{comm.target_audience}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Created: {new Date(comm.created_at).toLocaleDateString()}
                {comm.sent_date && (
                  <span className="ml-4">
                    Sent: {new Date(comm.sent_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="text-sm bg-muted p-3 rounded">
                {comm.message.length > 200 
                  ? `${comm.message.substring(0, 200)}...`
                  : comm.message
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommunications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No communications found</p>
        </div>
      )}
    </div>
  );
}