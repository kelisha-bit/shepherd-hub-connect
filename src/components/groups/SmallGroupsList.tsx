import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Calendar, MapPin, Clock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmallGroup {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  meeting_day: string;
  meeting_time: string;
  meeting_location: string;
  max_members: number;
  leader_name?: string;
  member_count?: number;
  is_member?: boolean;
}

export function SmallGroupsList() {
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [myGroups, setMyGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Fetch all groups with leader info
      const { data: allGroups, error: groupsError } = await supabase
        .from("small_groups")
        .select(`
          *,
          leader:members!small_groups_leader_id_fkey(first_name, last_name),
          group_members:small_group_members(count)
        `);

      if (groupsError) throw groupsError;

      // Fetch user's group memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("small_group_members")
        .select("group_id")
        .eq("member_id", user?.id);

      if (membershipError) throw membershipError;

      // Process the data
      const memberGroupIds = new Set(memberships?.map(m => m.group_id) || []);
      
      const processedGroups = allGroups?.map(group => ({
        ...group,
        leader_name: group.leader ? `${group.leader.first_name} ${group.leader.last_name}` : "Unknown",
        member_count: group.group_members?.[0]?.count || 0,
        is_member: memberGroupIds.has(group.id)
      })) || [];

      setGroups(processedGroups);
      setMyGroups(processedGroups.filter(g => g.is_member));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch small groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from("small_group_members")
        .insert([{
          group_id: groupId,
          member_id: user?.id,
          role: "member"
        }]);

      if (error) throw error;

      // Update local state
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return { ...group, is_member: true, member_count: (group.member_count || 0) + 1 };
        }
        return group;
      });

      setGroups(updatedGroups);
      setMyGroups(updatedGroups.filter(g => g.is_member));
      
      toast({
        title: "Success",
        description: "You have joined the group successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the group",
        variant: "destructive",
      });
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading small groups...</div>;
  }

  const renderGroupCard = (group: SmallGroup) => (
    <Card key={group.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription>Led by {group.leader_name}</CardDescription>
          </div>
          <Badge variant="outline">{group.member_count} members</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{group.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{group.meeting_day}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{group.meeting_time}</span>
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{group.meeting_location}</span>
          </div>
        </div>
        {!group.is_member && (
          <Button onClick={() => joinGroup(group.id)} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Join Group
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Small Groups</h1>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.length > 0 ? (
              filteredGroups.map(renderGroupCard)
            ) : (
              <div className="text-center py-12 col-span-full">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No groups found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try a different search term" : "There are no small groups available at the moment"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-groups" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myGroups.length > 0 ? (
              myGroups
                .filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(renderGroupCard)
            ) : (
              <div className="text-center py-12 col-span-full">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">You haven't joined any groups yet</h3>
                <p className="text-muted-foreground">Join a group to see it here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}