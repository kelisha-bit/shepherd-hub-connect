import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HandHeart, Calendar, Heart, Lock, Search, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types for better type safety
interface PrayerRequest {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  is_private: boolean;
  is_public: boolean;
  status: 'active' | 'answered';
  created_at: string;
  updated_at: string;
}

interface NewPrayerRequest {
  title: string;
  description: string;
  is_private: boolean;
}

export default function PrayerRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState<NewPrayerRequest>({ 
    title: "", 
    description: "", 
    is_private: false 
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<NewPrayerRequest>>({});

  useEffect(() => {
    if (user) {
      fetchPrayerRequests();
    }
  }, [user]);

  const fetchPrayerRequests = async () => {
    try {
      if (!user?.id) {
        console.log("No authenticated user found");
        setPrayerRequests([]);
        return;
      }

      console.log("Fetching prayer requests for user:", user.email);
      
      // Directly fetch prayer requests using auth.uid() as requester_id
      // The RLS policies will handle access control
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching prayer requests:", error);
        throw error;
      }
      
      console.log("Fetched prayer requests:", data?.length || 0);
      setPrayerRequests(data || []);
    } catch (error) {
      console.error("Error in fetchPrayerRequests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch prayer requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<NewPrayerRequest> = {};
    
    if (!newRequest.title.trim()) {
      newErrors.title = "Title is required";
    } else if (newRequest.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }
    
    if (!newRequest.description.trim()) {
      newErrors.description = "Description is required";
    } else if (newRequest.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a prayer request",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log("Submitting prayer request for user:", user.email);
      
      // Ensure member record exists before submitting prayer request
      let memberExists = false;
      
      // Check if member record exists
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("members")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        console.error("Error checking member record:", memberCheckError);
        throw new Error("Failed to verify member profile. Please try again.");
      }
      
      memberExists = !!existingMember;
      
      // Create member record if it doesn't exist
      if (!memberExists) {
        console.log("Creating member record for user:", user.email);
        console.log("User metadata:", user.user_metadata);
        
        // Prepare member data with proper defaults
        const memberData = {
          id: user.id, // Use auth.uid() as member ID
          email: user.email || '',
          first_name: user.user_metadata?.first_name || 
                     (user.user_metadata?.name ? user.user_metadata.name.split(' ')[0] : null) || 
                     user.user_metadata?.full_name?.split(' ')[0] || 
                     'Member',
          last_name: user.user_metadata?.last_name || 
                    (user.user_metadata?.name ? user.user_metadata.name.split(' ').slice(1).join(' ') : null) || 
                    user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                    'User'
          // Removed member_status as it doesn't exist in current schema
        };
        
        console.log("Member data to insert:", memberData);
        
        const { error: memberCreateError, data: createdMember } = await supabase
          .from("members")
          .insert(memberData)
          .select()
          .single();
        
        if (memberCreateError) {
          console.error("Error creating member record:", memberCreateError);
          console.error("Error details:", {
            code: memberCreateError.code,
            message: memberCreateError.message,
            details: memberCreateError.details,
            hint: memberCreateError.hint
          });
          
          // Handle specific error cases
          if (memberCreateError.code === '23505') {
            // Unique constraint violation - member might already exist
            console.log("Member record already exists, continuing...");
          } else if (memberCreateError.code === '42501') {
            // Permission denied - RLS policy issue
            throw new Error("Permission denied. Please ensure you're properly authenticated.");
          } else if (memberCreateError.code === '23502') {
            // Not null violation
            throw new Error("Missing required information. Please check your profile data.");
          } else {
            throw new Error(`Failed to create member profile: ${memberCreateError.message}`);
          }
        } else {
          console.log("Successfully created member record:", createdMember);
        }
      }
      
      // Create the prayer request with the correct schema mapping
      const prayerRequestData = {
        requester_id: user.id, // Use auth.uid() directly
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        is_private: newRequest.is_private,
        status: "active" as const
      };
      
      console.log("Prayer request data:", prayerRequestData);
      
      const { data, error } = await supabase
        .from("prayer_requests")
        .insert([prayerRequestData])
        .select()
        .single();

      if (error) {
        console.error("Error inserting prayer request:", error);
        
        // Handle specific error cases
        if (error.code === '23503') {
          throw new Error("Please complete your member profile before submitting prayer requests.");
        }
        
        throw error;
      }

      console.log("Successfully created prayer request:", data);
      
      // Update local state
      setPrayerRequests([data, ...prayerRequests]);
      setNewRequest({ title: "", description: "", is_private: false });
      
      toast({
        title: "Success",
        description: "Prayer request submitted successfully",
      });
    } catch (error: any) {
      console.error("Prayer request submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit prayer request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'answered') => {
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("requester_id", user?.id); // Ensure user can only update their own requests

      if (error) {
        console.error("Error updating prayer request status:", error);
        throw error;
      }

      // Update local state
      setPrayerRequests(prayerRequests.map(request => 
        request.id === id ? { ...request, status: newStatus, updated_at: new Date().toISOString() } : request
      ));

      toast({
        title: "Success",
        description: `Prayer request marked as ${newStatus === 'answered' ? 'answered' : 'active'}`,
      });
    } catch (error: any) {
      console.error("Status update error:", error);
      toast({
        title: "Error",
        description: "Failed to update prayer request status. Please try again.",
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newRequest.title}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, title: e.target.value });
                    // Clear error when user starts typing
                    if (errors.title) {
                      setErrors({ ...errors, title: undefined });
                    }
                  }}
                  placeholder="Prayer request title"
                  maxLength={100}
                  className={`bg-background/50 ${
                    errors.title ? "border-destructive focus:border-destructive" : ""
                  }`}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.title}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {newRequest.title.length}/100 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => {
                    setNewRequest({ ...newRequest, description: e.target.value });
                    // Clear error when user starts typing
                    if (errors.description) {
                      setErrors({ ...errors, description: undefined });
                    }
                  }}
                  placeholder="Describe your prayer request in detail..."
                  maxLength={1000}
                  rows={4}
                  className={`bg-background/50 resize-none ${
                    errors.description ? "border-destructive focus:border-destructive" : ""
                  }`}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {newRequest.description.length}/1000 characters
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={newRequest.is_private}
                    onCheckedChange={(checked) => setNewRequest({ ...newRequest, is_private: checked })}
                  />
                  <Label htmlFor="private" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Make this request private
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  {newRequest.is_private 
                    ? "Only you will be able to see this prayer request" 
                    : "This prayer request will be visible to other church members"}
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={submitting || !user} 
                className="w-full"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Prayer Request"
                )}
              </Button>
              
              {!user && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You must be logged in to submit a prayer request.
                  </AlertDescription>
                </Alert>
              )}
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
              (() => {
                const activeRequests = prayerRequests.filter(request => request.status === "active");
                
                if (activeRequests.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <HandHeart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        No Active Prayer Requests
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't submitted any prayer requests yet.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Use the form above to share your prayer needs with the community.
                      </p>
                    </div>
                  );
                }
                
                return activeRequests.map(request => (
                  <Card key={request.id} className="bg-card/50 backdrop-blur-sm border-primary/10 transition-all hover:shadow-md">
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
                      <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
                      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted {new Date(request.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                        {request.updated_at !== request.created_at && (
                          <span className="text-xs">
                            Updated {new Date(request.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(request.id, "answered")}
                        className="hover:bg-success/10 hover:border-success/20 hover:text-success"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Mark as Answered
                      </Button>
                    </CardFooter>
                  </Card>
                ));
              })()
            )}
          </TabsContent>

          <TabsContent value="answered" className="space-y-4">
            {(() => {
              const answeredRequests = prayerRequests.filter(request => request.status === "answered");
              
              if (answeredRequests.length === 0) {
                return (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No Answered Prayers Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      When your prayers are answered, they'll appear here.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mark your active prayer requests as answered to celebrate God's faithfulness.
                    </p>
                  </div>
                );
              }
              
              return answeredRequests.map(request => (
                <Card key={request.id} className="bg-success/5 border-success/20 transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-success" />
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        <Heart className="h-3 w-3 mr-1" />
                        Answered
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted {new Date(request.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      {request.updated_at !== request.created_at && (
                        <div className="flex items-center gap-1 text-success">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs">
                            Answered {new Date(request.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, "active")}
                      className="hover:bg-primary/10 hover:border-primary/20"
                    >
                      <HandHeart className="h-4 w-4 mr-1" />
                      Move to Active
                    </Button>
                  </CardFooter>
                </Card>
              ));
            })()
            }
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}