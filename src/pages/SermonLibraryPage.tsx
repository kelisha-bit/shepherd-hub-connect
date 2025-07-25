import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Calendar, Download, Search, Play, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Sample sermon data for when the table doesn't exist
const sampleSermons = [
  {
    id: '1',
    title: 'Faith in Action',
    preacher: 'Pastor John Smith',
    date: '2024-01-15',
    description: 'A powerful message about living out our faith through action and service to others.',
    category: 'Faith & Works',
    scripture_reference: 'James 2:14-26',
    audio_url: 'https://example.com/sermon1.mp3',
    video_url: 'https://example.com/sermon1.mp4',
    notes_url: 'https://example.com/sermon1-notes.pdf',
    tags: ['faith', 'action', 'service'],
    duration: '45 minutes'
  },
  {
    id: '2',
    title: 'The Power of Prayer',
    preacher: 'Pastor Mary Johnson',
    date: '2024-01-08',
    description: 'Understanding the importance and effectiveness of prayer in our daily lives.',
    category: 'Prayer & Worship',
    scripture_reference: 'Matthew 6:5-15',
    audio_url: 'https://example.com/sermon2.mp3',
    video_url: 'https://example.com/sermon2.mp4',
    notes_url: 'https://example.com/sermon2-notes.pdf',
    tags: ['prayer', 'worship', 'spiritual growth'],
    duration: '40 minutes'
  },
  {
    id: '3',
    title: 'Love Your Neighbor',
    preacher: 'Pastor David Wilson',
    date: '2024-01-01',
    description: 'Exploring what it means to truly love our neighbors as ourselves in modern times.',
    category: 'Love & Community',
    scripture_reference: 'Mark 12:28-34',
    audio_url: 'https://example.com/sermon3.mp3',
    video_url: 'https://example.com/sermon3.mp4',
    notes_url: 'https://example.com/sermon3-notes.pdf',
    tags: ['love', 'community', 'relationships'],
    duration: '50 minutes'
  },
  {
    id: '4',
    title: 'Walking in Grace',
    preacher: 'Pastor Sarah Brown',
    date: '2023-12-25',
    description: 'A Christmas message about the grace of God and how it transforms our lives.',
    category: 'Grace & Salvation',
    scripture_reference: 'Ephesians 2:8-10',
    audio_url: 'https://example.com/sermon4.mp3',
    video_url: 'https://example.com/sermon4.mp4',
    notes_url: 'https://example.com/sermon4-notes.pdf',
    tags: ['grace', 'salvation', 'christmas'],
    duration: '35 minutes'
  },
  {
    id: '5',
    title: 'Hope in Difficult Times',
    preacher: 'Pastor Michael Davis',
    date: '2023-12-18',
    description: 'Finding hope and strength when facing life\'s challenges and uncertainties.',
    category: 'Hope & Encouragement',
    scripture_reference: 'Romans 15:13',
    audio_url: 'https://example.com/sermon5.mp3',
    video_url: 'https://example.com/sermon5.mp4',
    notes_url: 'https://example.com/sermon5-notes.pdf',
    tags: ['hope', 'encouragement', 'perseverance'],
    duration: '42 minutes'
  },
  {
    id: '6',
    title: 'The Good Shepherd',
    preacher: 'Pastor Jennifer Lee',
    date: '2023-12-11',
    description: 'Understanding Jesus as our shepherd and what it means to follow Him.',
    category: 'Jesus & Discipleship',
    scripture_reference: 'John 10:11-18',
    audio_url: 'https://example.com/sermon6.mp3',
    video_url: 'https://example.com/sermon6.mp4',
    notes_url: 'https://example.com/sermon6-notes.pdf',
    tags: ['jesus', 'discipleship', 'guidance'],
    duration: '38 minutes'
  }
];

export default function SermonLibraryPage() {
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      console.log("Fetching sermons from database...");
      
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.log("Error fetching sermons:", error);
        // If table doesn't exist or other error, use sample data
        console.log("Using sample sermon data as fallback");
        setSermons(sampleSermons);
        setUsingFallbackData(true);
        // Only show error toast for non-table-missing errors
        if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
          toast({
            title: "Database Error",
            description: "Using sample data. " + error.message,
            variant: "destructive",
          });
        }
      } else {
        console.log("Successfully fetched sermons:", data?.length || 0);
        // If the table is empty, use sample data
        if (!data || data.length === 0) {
          setSermons(sampleSermons);
          setUsingFallbackData(true);
        } else {
          setSermons(data);
          setUsingFallbackData(false);
        }
      }
    } catch (error) {
      console.error("Exception fetching sermons:", error);
      // Use sample data on any exception
      setSermons(sampleSermons);
      setUsingFallbackData(true);
      toast({
        title: "Error",
        description: "Using sample data due to connection issues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Strict filtering for categories to prevent Select.Item errors
  const categories = [
    ...new Set(
      sermons
        .map(sermon => sermon.category)
        .filter(
          cat =>
            typeof cat === "string" &&
            cat !== null &&
            cat !== undefined &&
            cat.trim() !== ""
        )
    ),
  ];
  console.log("Categories for Select:", categories);
  console.log("SermonLibraryPage: Sample categories from sermons:", sermons.map(s => s.category));

  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.scripture_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || sermon.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handlePlay = (sermon) => {
    console.log("Playing sermon:", sermon.title);
    toast({
      title: "Playing Sermon",
      description: `Now playing: ${sermon.title}`,
    });
    // In a real app, this would integrate with an audio/video player
  };

  const handleDownload = (sermon) => {
    console.log("Downloading sermon:", sermon.title);
    toast({
      title: "Download Started",
      description: `Downloading: ${sermon.title}`,
    });
    // In a real app, this would trigger actual download
  };

  const handleNotesDownload = (sermon) => {
    console.log("Downloading notes for:", sermon.title);
    toast({
      title: "Notes Download",
      description: `Downloading notes for: ${sermon.title}`,
    });
    // In a real app, this would download the notes PDF
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8 px-4 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-primary">Sermon Library</h1>
          {usingFallbackData && (
            <p className="text-sm text-muted-foreground">
              Showing sample sermons (database table not configured yet)
            </p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sermons, preachers, or scripture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-sm"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories
                .filter(category => category && typeof category === 'string' && category.trim() !== '')
                .map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading sermons...</p>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sermons found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter 
                ? "Try adjusting your search or filter criteria"
                : "No sermons are available yet"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSermons.map(sermon => (
              <Card key={sermon.id} className="group hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="line-clamp-2 text-base">{sermon.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(sermon.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    by {sermon.preacher}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{sermon.description}</p>
                  <div className="text-sm">
                    <strong>Scripture:</strong> {sermon.scripture_reference}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sermon.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {sermon.duration && (
                    <div className="text-xs text-muted-foreground">
                      Duration: {sermon.duration}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="group-hover:bg-primary/10"
                    onClick={() => handlePlay(sermon)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                  <div className="flex gap-2">
                    {sermon.notes_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="group-hover:bg-primary/10"
                        onClick={() => handleNotesDownload(sermon)}
                        title="Download Notes"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="group-hover:bg-primary/10"
                      onClick={() => handleDownload(sermon)}
                      title="Download Sermon"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}