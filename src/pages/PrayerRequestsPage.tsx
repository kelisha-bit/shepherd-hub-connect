import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HandHeart, Calendar, Heart, Lock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PrayerRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({ title: "", description: "", is_private: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPrayerRequests();
    }
  }, [user]);

  const fetchPrayerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("requester_id", user?.id)  // Changed from member_id to requester_id
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from("prayer_requests")
        .insert([{
          requester_id: user?.id,  // Changed from member_id to requester_id
          title: newRequest.title,
          description: newRequest.description,
          is_private: newRequest.is_private,
          status: "active"
        }])
        .select();

      if (error) throw error;

      setPrayerRequests([data[0], ...prayerRequests]);
      setNewRequest({ title: "", description: "", is_private: false });
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setPrayerRequests(prayerRequests.map(request => 
        request.id === id ? { ...request, status: newStatus } : request
      ));

      toast({
        title: "Success",
        description: "Prayer request status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8 px-4 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-primary">Prayer Requests</h1>
        
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <CardTitle>Submit a Prayer Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Prayer request title"
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe your prayer request..."
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={newRequest.is_private}
                  onCheckedChange={(checked) => setNewRequest({ ...newRequest, is_private: checked })}
                />
                <Label htmlFor="private">Make this request private</Label>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Prayer Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Requests</TabsTrigger>
            <TabsTrigger value="answered">Answered Prayers</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading prayer requests...</p>
              </div>
            ) : (
              prayerRequests
                .filter(request => request.status === "active")
                .map(request => (
                  <Card key={request.id} className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HandHeart className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                        </div>
                        {request.is_private && (
                          <Badge variant="secondary" className="bg-primary/10">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{request.description}</p>
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, "answered")}
                        className="hover:bg-primary/10"
                      >
                        Mark as Answered
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="answered" className="space-y-4">
            {prayerRequests
              .filter(request => request.status === "answered")
              .map(request => (
                <Card key={request.id} className="bg-success/5 border-success/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-success" />
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Answered
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{request.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, "active")}
                      className="hover:bg-success/10"
                    >
                      Move to Active
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}