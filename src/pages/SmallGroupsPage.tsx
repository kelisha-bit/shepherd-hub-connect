import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Calendar, MapPin, Clock, Search, UserPlus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define types for small groups data
interface SmallGroup {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  meeting_day: string;
  meeting_time: string;
  location: string; // Changed from meeting_location to location
  max_members: number;
  is_active?: boolean; // Make is_active optional
  created_at?: string;
  updated_at?: string;
}

interface ProcessedSmallGroup extends SmallGroup {
  leader_name: string;
  member_count: number;
  is_member: boolean;
}

export default function SmallGroupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<ProcessedSmallGroup[]>([]);
  const [myGroups, setMyGroups] = useState<ProcessedSmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add retry functionality
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchGroups();
  };

  const fetchGroups = async () => {
    try {
      console.log("Fetching small groups...");
      setError(null);
      
      // Find current user's member ID
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("id")
        .eq("email", user?.email)
        .maybeSingle();
      
      if (memberError) {
        console.error("Error fetching member ID:", memberError);
        // Continue with user ID as fallback
      }
      
      console.log("Member data:", memberData);
      const memberId = memberData?.id || user?.id;
      console.log("Using member ID:", memberId);
      
      if (!memberId) {
        console.error("No member ID or user ID available");
        setError("Could not identify your account. Please try logging out and back in.");
        toast({
          title: "Authentication Error",
          description: "Could not identify your account. Please try logging out and back in.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // First, try to get the table structure to check if is_active exists
      console.log("Checking small_groups table structure...");
      try {
        const { data: tableInfo, error: tableError } = await supabase
          .from('small_groups')
          .select('*')
          .limit(1);
          
        if (tableError) {
          console.error("Error checking small_groups table structure:", tableError);
          console.error("Error details:", JSON.stringify(tableError));
        } else {
          console.log("Small groups table structure:", tableInfo);
          // Check if sample data has is_active field
          const hasIsActive = tableInfo && tableInfo.length > 0 && 'is_active' in tableInfo[0];
          console.log("Table has is_active field:", hasIsActive);
        }
      } catch (tableErr) {
        console.error("Exception checking table structure:", tableErr);
      }
      
      // Fetch all small groups - try without the is_active filter first
      console.log("Fetching all small groups without filter...");
      const { data: allGroups, error: groupsError } = await supabase
        .from('small_groups')
        .select('*');

      if (groupsError) {
        console.error("Error fetching small groups:", groupsError);
        console.error("Error details:", JSON.stringify(groupsError));
        setError("Could not fetch small groups. Please try again later.");
        toast({
          title: "Database Error",
          description: "Could not fetch small groups. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      console.log("All groups data:", allGroups);
      
      if (!allGroups || allGroups.length === 0) {
        console.log("No small groups found");
        setGroups([]);
        setMyGroups([]);
        setLoading(false);
        return;
      }
      
      // Filter active groups client-side if needed
      const activeGroups = allGroups.filter(group => 
        !('is_active' in group) || group.is_active === true
      );
      console.log("Active groups:", activeGroups);
      
      // Get leaders' information
      const leaderIds = activeGroups.map(g => g.leader_id).filter(Boolean) || [];
      console.log("Leader IDs:", leaderIds);
      
      let leaders: any[] = [];
      if (leaderIds.length > 0) {
        const { data: leadersData, error: leadersError } = await supabase
          .from('members')
          .select('id, first_name, last_name')
          .in('id', leaderIds);
          
        if (leadersError) {
          console.error("Error fetching leaders:", leadersError);
          // Continue with empty leaders array
        } else {
          leaders = leadersData || [];
        }
      }
      
      console.log("Leaders data:", leaders);

      // Create a map of leader_id to leader info for quick lookup
      const leaderMap = new Map(leaders.map(leader => [leader.id, leader]) || []);
      console.log("Leader map created:", Array.from(leaderMap.entries()));

      // Get member counts for each group
      let memberCounts: any[] = [];
      try {
        const { data, error: countError } = await supabase
          .from("small_group_members")
          .select("group_id")
          .in("group_id", activeGroups.map(g => g.id));

        if (countError) {
          console.error("Error fetching member counts:", countError);
          // Continue with empty counts
        } else {
          memberCounts = data || [];
        }
      } catch (countErr) {
        console.error("Exception fetching member counts:", countErr);
        // Continue with empty counts
      }
      
      console.log("Member counts data:", memberCounts);

      const countMap = memberCounts.reduce((acc, membership) => {
        acc[membership.group_id] = (acc[membership.group_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      console.log("Count map:", countMap);

      // Get user's memberships
      let memberships: any[] = [];
      try {
        const { data, error: membershipError } = await supabase
          .from("small_group_members")
          .select("group_id")
          .eq("member_id", memberId);

        if (membershipError) {
          console.error("Error fetching memberships:", membershipError);
          // Continue with empty memberships
        } else {
          memberships = data || [];
        }
      } catch (membershipErr) {
        console.error("Exception fetching memberships:", membershipErr);
        // Continue with empty memberships
      }
      
      console.log("Memberships data:", memberships);

      const memberGroupIds = new Set(memberships.map(m => m.group_id) || []);
      console.log("Member group IDs:", Array.from(memberGroupIds));
      
      const processedGroups = activeGroups.map(group => {
        const leader = leaderMap.get(group.leader_id);
        return {
          ...group,
          leader_name: leader ? `${leader.first_name} ${leader.last_name}` : "Unknown",
          member_count: countMap[group.id] || 0,
          is_member: memberGroupIds.has(group.id)
        };
      });
      
      console.log("Processed groups:", processedGroups);

      setGroups(processedGroups);
      setMyGroups(processedGroups.filter(g => g.is_member));
    } catch (error) {
      console.error("Failed to fetch small groups:", error);
      console.error("Error details:", error instanceof Error ? error.message : JSON.stringify(error));
      setError("An unexpected error occurred. Please try again later.");
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to fetch small groups: ${error.message}`
          : "Failed to fetch small groups. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      // Find member ID
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("id")
        .eq("email", user?.email)
        .maybeSingle();
      
      if (memberError) {
        console.error("Error fetching member ID for join:", memberError);
        toast({
          title: "Error",
          description: "Could not find your member profile",
          variant: "destructive",
        });
        return;
      }
      
      const memberId = memberData?.id || user?.id;
      
      if (!memberId) {
        console.error("No member ID or user ID available for join");
        toast({
          title: "Authentication Error",
          description: "Could not identify your account. Please try logging out and back in.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from("small_group_members")
        .insert([{
          group_id: groupId,
          member_id: memberId,
          role: "member"
        }]);

      if (error) {
        // Check for duplicate/conflict error
        const isConflict = error.code === "23505" || 
                           error.message?.toLowerCase().includes("duplicate") || 
                           error.message?.toLowerCase().includes("conflict") || 
                           error.details?.toLowerCase().includes("duplicate") || 
                           error.details?.toLowerCase().includes("conflict");
                           
        if (isConflict) {
          toast({
            title: "Already a member",
            description: "You have already joined this group.",
            variant: "destructive",
          });
          return;
        }
        console.error("Supabase join group error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to join group",
          variant: "destructive",
        });
        return;
      }

      // Update local state with the new membership
      setGroups(groups.map(group =>
        group.id === groupId
          ? { ...group, is_member: true, member_count: group.member_count + 1 }
          : group
      ));
      
      // Add the group to myGroups if not already there
      const groupToAdd = groups.find(group => group.id === groupId);
      if (groupToAdd && !myGroups.some(g => g.id === groupId)) {
        setMyGroups([
          ...myGroups,
          { ...groupToAdd, is_member: true, member_count: groupToAdd.member_count + 1 }
        ]);
      }

      toast({
        title: "Success",
        description: "Successfully joined the group",
      });
    } catch (error) {
      console.error("Join group error (catch block):", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to join group: ${error.message}` 
          : "Failed to join group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8 px-4 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-primary">Small Groups</h1>

        {error ? (
          <div className="text-center py-12">
            <div className="mb-4 text-destructive">{error}</div>
            <Button onClick={handleRetry}>
              Retry
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
                <TabsTrigger value="all">All Groups</TabsTrigger>
                <TabsTrigger value="my-groups">My Groups</TabsTrigger>
              </TabsList>

              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading groups...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map(group => (
                    <Card key={group.id} className="group hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <CardTitle>{group.name}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10">
                            {group.member_count}/{group.max_members} members
                          </Badge>
                        </div>
                        <CardDescription>{group.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{group.meeting_day}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{group.meeting_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{group.location || "Location TBD"}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Led by {group.leader_name}
                        </div>
                        {group.is_member ? (
                          <Button variant="secondary" size="sm" className="bg-primary/10" disabled>
                            <Check className="h-4 w-4 mr-2" />
                            Joined
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinGroup(group.id)}
                            disabled={group.member_count >= group.max_members}
                            className="group-hover:bg-primary/10"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join Group
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-groups" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map(group => (
                  <Card key={group.id} className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <CardTitle>{group.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10">
                          {group.member_count}/{group.max_members} members
                        </Badge>
                      </div>
                      <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{group.meeting_day}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{group.meeting_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{group.location || "Location TBD"}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-muted-foreground">
                        Led by {group.leader_name}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}