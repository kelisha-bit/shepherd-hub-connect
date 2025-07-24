import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Download, ExternalLink, Mic, Search, Video, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SermonPlayer } from "./SermonPlayer";

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  description: string;
  scripture_reference: string;
  audio_url: string;
  video_url: string;
  notes_url: string;
  category: string;
  tags: string[];
}

export function SermonLibrary() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sermons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(sermons.map(sermon => sermon.category).filter(Boolean)));

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = 
      sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.scripture_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || sermon.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="p-6">Loading sermons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sermon Library</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search sermons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="w-full md:w-auto">
          <Tabs 
            value={selectedCategory || "all"} 
            onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
            className="w-full"
          >
            <TabsList className="w-full md:w-auto overflow-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSermons.length > 0 ? (
          filteredSermons.map(sermon => (
            <Card key={sermon.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{sermon.title}</CardTitle>
                    <CardDescription>By {sermon.preacher}</CardDescription>
                  </div>
                  {sermon.category && (
                    <Badge variant="outline">{sermon.category}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(sermon.date).toLocaleDateString()}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sermon.scripture_reference && (
                  <div className="text-sm font-medium">
                    Scripture: {sermon.scripture_reference}
                  </div>
                )}
                <p className="text-sm">{sermon.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {sermon.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {sermon.audio_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSermon(sermon);
                        setPlayerOpen(true);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Sermon
                    </Button>
                  )}
                  {sermon.video_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={sermon.video_url} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        Watch Video
                      </a>
                    </Button>
                  )}
                  {sermon.notes_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={sermon.notes_url} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Notes
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No sermons found</p>
          </div>
        )}
      </div>

      {selectedSermon && (
        <SermonPlayer 
          sermon={selectedSermon} 
          isOpen={playerOpen} 
          onOpenChange={setPlayerOpen} 
        />
      )}
    </div>
  );
}