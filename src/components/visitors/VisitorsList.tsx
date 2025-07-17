import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Visitor {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  visit_date: string;
  visited_before: boolean;
  follow_up_required: boolean;
  follow_up_date?: string;
  notes?: string;
}

export function VisitorsList() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .order("visit_date", { ascending: false });

      if (error) throw error;
      setVisitors(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch visitors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    `${visitor.first_name} ${visitor.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading visitors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Visitors</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Visitor
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search visitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVisitors.map((visitor) => (
          <Card key={visitor.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {visitor.first_name} {visitor.last_name}
              </CardTitle>
              <div className="flex gap-2">
                {visitor.visited_before && (
                  <Badge variant="secondary">Returning</Badge>
                )}
                {visitor.follow_up_required && (
                  <Badge variant="outline">Follow-up Required</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Visited: {new Date(visitor.visit_date).toLocaleDateString()}
              </div>
              
              {visitor.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{visitor.email}</span>
                </div>
              )}
              
              {visitor.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{visitor.phone_number}</span>
                </div>
              )}
              
              {(visitor.city || visitor.state) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{[visitor.city, visitor.state].filter(Boolean).join(", ")}</span>
                </div>
              )}
              
              {visitor.notes && (
                <div className="text-sm bg-muted p-2 rounded">
                  {visitor.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVisitors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No visitors found</p>
        </div>
      )}
    </div>
  );
}