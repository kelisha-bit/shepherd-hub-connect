import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";

export default function MemberCommunicationsPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    setLoading(true);
    // In a real implementation, this would fetch from the database
    // For now, we'll use mock data
    const mockMessages = [
      { id: 1, subject: "Welcome to the Church!", body: "Dear member, welcome to our church community!", type: "email", date: "2024-07-20" },
      { id: 2, subject: "Upcoming Event Reminder", body: "Don't forget about our special service this Sunday!", type: "sms", date: "2024-07-19" },
    ];
    setMessages(mockMessages);
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSending(true);
    // In a real implementation, this would send to the database
    setTimeout(() => {
      setSending(false);
      setNewMessage({ subject: "", body: "" });
      // Add the new message to the list
      setMessages([
        {
          id: Date.now(),
          subject: newMessage.subject,
          body: newMessage.body,
          type: "email",
          date: new Date().toISOString().split("T")[0],
        },
        ...messages,
      ]);
    }, 1000);
  };

  return (
    <div className="py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Communication Center</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Send Message to Church</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="font-medium">Subject</label>
              <Input 
                value={newMessage.subject} 
                onChange={e => setNewMessage({...newMessage, subject: e.target.value})} 
                placeholder="Message subject" 
                required 
              />
            </div>
            <div>
              <label className="font-medium">Message</label>
              <Textarea 
                value={newMessage.body} 
                onChange={e => setNewMessage({...newMessage, body: e.target.value})} 
                rows={5} 
                placeholder="Type your message..." 
                required 
              />
            </div>
            <Button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <Card key={message.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{message.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground">{message.date}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {message.type === "email" ? (
                          <><Mail className="h-3 w-3" /> Email</>
                        ) : (
                          <><MessageSquare className="h-3 w-3" /> SMS</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{message.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}