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

export default function SmallGroupsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      // First, get all small groups with member count
      const { data: allGroups, error: groupsError } = await supabase
        .from('small_groups')
        .select(`
          *,
          group_members:small_group_members(count)
        `);

      if (groupsError) throw groupsError;

      // Then get all leaders' information in a single query
      const leaderIds = allGroups?.map(g => g.leader_id).filter(Boolean) || [];
      const { data: leaders, error: leadersError } = leaderIds.length > 0 
        ? await supabase
            .from('members')
            .select('id, first_name, last_name')
            .in('id', leaderIds)
        : { data: [], error: null };

      if (leadersError) throw leadersError;

      // Create a map of leader_id to leader info for quick lookup
      const leaderMap = new Map(leaders?.map(leader => [leader.id, leader]) || []);

      if (groupsError) throw groupsError;

      const { data: memberships, error: membershipError } = await supabase
        .from("small_group_members")
        .select("group_id")
        .eq("member_id", user?.id);

      if (membershipError) throw membershipError;

      const memberGroupIds = new Set(memberships?.map(m => m.group_id) || []);
      
      const processedGroups = allGroups?.map(group => {
        const leader = leaderMap.get(group.leader_id);
        return {
          ...group,
          leader_name: leader ? `${leader.first_name} ${leader.last_name}` : "Unknown",
          member_count: group.group_members?.[0]?.count || 0,
          is_member: memberGroupIds.has(group.id)
        };
      }) || [];

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

  const handleJoinGroup = async (groupId) => {
    try {
      const { error } = await supabase
        .from("small_group_members")
        .insert([{
          group_id: groupId,
          member_id: user?.id,
          role: "member"
        }]);

      if (error) throw error;

      setGroups(groups.map(group =>
        group.id === groupId
          ? { ...group, is_member: true, member_count: group.member_count + 1 }
          : group
      ));

      toast({
        title: "Success",
        description: "Successfully joined the group",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join group",
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
                        <span>{group.location}</span>
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
                      <span>{group.location}</span>
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
      </div>
    </div>
  );
}