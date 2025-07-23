import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PrayingHands, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  status: 'pending' | 'in_progress' | 'answered';
  created_at: string;
}

export function PrayerRequestsList() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRequest, setNewRequest] = useState({ title: "", description: "", is_public: false });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("member_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrayerRequests(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch prayer requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!newRequest.title || !newRequest.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("prayer_requests")
        .insert([{
          member_id: user?.id,
          title: newRequest.title,
          description: newRequest.description,
          is_public: newRequest.is_public,
          status: "pending"
        }])
        .select();

      if (error) throw error;

      setPrayerRequests([...(data || []), ...prayerRequests]);
      setNewRequest({ title: "", description: "", is_public: false });
      setDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Prayer request submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit prayer request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>;
      case "answered":
        return <Badge variant="success">Answered</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredRequests = prayerRequests.filter((request) =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading prayer requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prayer Requests</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Prayer Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Prayer Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Prayer request title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe your prayer request"
                  rows={5}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-public"
                  checked={newRequest.is_public}
                  onCheckedChange={(checked) => setNewRequest({ ...newRequest, is_public: checked })}
                />
                <Label htmlFor="is-public">Make this request visible to other members</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Submit Prayer Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search prayer requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <PrayingHands className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Submitted on {new Date(request.created_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  {request.is_public ? (
                    <Badge variant="outline">Public</Badge>
                  ) : (
                    <Badge variant="outline">Private</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <PrayingHands className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No prayer requests found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try a different search term" : "Submit your first prayer request"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}