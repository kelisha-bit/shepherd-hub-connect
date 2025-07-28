import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Send, Plus, Mail, MessageSquare, Users, User, Loader2, Edit, Trash2 } from "lucide-react";

// Types
interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  channel: string;
  created_at: string;
}

interface MessageLog {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  body: string;
  status: string;
  sent_at: string;
  template_id?: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

export default function CommunicationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  
  // Form state
  const [recipientType, setRecipientType] = useState("all_members");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("email");
  
  // Template management
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "", channel: "email" });
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTemplates(),
        fetchMembers(),
        fetchMessageLogs()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      console.log('Fetching members...');
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, phone_number')
        .order('first_name');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched members:', data);
      setMembers(data || []);
      
      // If no members found, show a warning
      if (!data || data.length === 0) {
        console.warn('No members found in the database');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load members. Please check the console for details.',
        variant: 'destructive'
      });
    }
  };

  const fetchMessageLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('message_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setMessageLogs(data || []);
    } catch (error) {
      console.error('Error fetching message logs:', error);
    }
  };

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    if (id === 'custom') {
      setSubject('');
      setBody('');
      return;
    }
    
    const template = templates.find(t => t.id === id);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setChannel(template.channel);
    }
  };

  const saveTemplate = async () => {
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('message_templates')
          .update({
            name: newTemplate.name,
            subject: newTemplate.subject,
            body: newTemplate.body,
            channel: newTemplate.channel
          })
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Template updated successfully" });
      } else {
        const { error } = await supabase
          .from('message_templates')
          .insert({
            name: newTemplate.name,
            subject: newTemplate.subject,
            body: newTemplate.body,
            channel: newTemplate.channel
          });
        
        if (error) throw error;
        toast({ title: "Success", description: "Template created successfully" });
      }
      
      setShowTemplateDialog(false);
      setNewTemplate({ name: "", subject: "", body: "", channel: "email" });
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      toast({ title: "Success", description: "Template deleted successfully" });
      fetchTemplates();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    }
  };

  const sendMessage = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Error", description: "Subject and message are required", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      let recipients: Member[] = [];
      
      if (recipientType === 'all_members') {
        recipients = members;
      } else if (recipientType === 'individual' && selectedMembers.length > 0) {
        recipients = members.filter(m => selectedMembers.includes(m.id));
      }

      if (recipients.length === 0) {
        toast({ title: "Error", description: "No recipients selected", variant: "destructive" });
        return;
      }

      // Create communication record
      const { data: commData, error: commError } = await supabase
        .from('communications')
        .insert({
          subject,
          message: body,
          communication_type: channel,
          target_audience: recipientType,
          status: 'sent',
          sent_date: new Date().toISOString(),
          sent_by: user?.id
        })
        .select()
        .single();

      if (commError) throw commError;

      // Create message logs for each recipient
      const logPromises = recipients.map(recipient => {
        const recipientContact = channel === 'email' ? recipient.email : recipient.phone_number;
        if (!recipientContact) return null;

        return supabase
          .from('message_logs')
          .insert({
            recipient: recipientContact,
            type: channel,
            subject,
            body,
            status: 'sent',
            template_id: templateId || null
          });
      }).filter(Boolean);

      await Promise.all(logPromises);

      toast({ title: "Success", description: `Message sent to ${recipients.length} recipients` });
      
      // Reset form
      setSubject('');
      setBody('');
      setTemplateId('');
      setSelectedMembers([]);
      
      // Refresh data
      fetchMessageLogs();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading communication center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-medium">Template Name</label>
                <Input
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="Template name"
                />
              </div>
              <div>
                <label className="font-medium">Channel</label>
                <Select value={newTemplate.channel} onValueChange={(value) => setNewTemplate({...newTemplate, channel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-medium">Subject</label>
                <Input
                  value={newTemplate.subject}
                  onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})}
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="font-medium">Message Body</label>
                <Textarea
                  value={newTemplate.body}
                  onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
                  rows={5}
                  placeholder="Message content (use {{name}} for member name)"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveTemplate}>
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowTemplateDialog(false);
                  setNewTemplate({ name: "", subject: "", body: "", channel: "email" });
                  setEditingTemplate(null);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Send Message</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium">Recipient Type</label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_members">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          All Members
                        </div>
                      </SelectItem>
                      <SelectItem value="individual">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Individual Members
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium">Channel</label>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          SMS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {recipientType === 'individual' && (
                <div>
                  <label className="font-medium">Select Members</label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={member.id}
                          checked={selectedMembers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, member.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                            }
                          }}
                        />
                        <label htmlFor={member.id} className="text-sm">
                          {member.first_name} {member.last_name} ({channel === 'email' ? member.email : member.phone_number || 'No phone'})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-medium">Template</label>
                <Select value={templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template or create custom message" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.channel === channel).map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium">Subject</label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Message subject"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Message</label>
                <Textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={6}
                  placeholder="Type your message... Use {{name}} for member name"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={sendMessage} disabled={sending || !subject.trim() || !body.trim()}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  setSubject('');
                  setBody('');
                  setTemplateId('');
                  setSelectedMembers([]);
                }}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map(template => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline">
                            {template.channel === 'email' ? (
                              <><Mail className="h-3 w-3 mr-1" />Email</>
                            ) : (
                              <><MessageSquare className="h-3 w-3 mr-1" />SMS</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{template.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.body.length > 150 ? `${template.body.substring(0, 150)}...` : template.body}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(template);
                            setNewTemplate({
                              name: template.name,
                              subject: template.subject,
                              body: template.body,
                              channel: template.channel
                            });
                            setShowTemplateDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {templates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates created yet. Click "Manage Templates" to create your first template.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messageLogs.map(log => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{log.subject}</h3>
                          <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                          <Badge variant="outline">
                            {log.type === 'email' ? (
                              <><Mail className="h-3 w-3 mr-1" />Email</>
                            ) : (
                              <><MessageSquare className="h-3 w-3 mr-1" />SMS</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          To: {log.recipient} • {new Date(log.sent_at).toLocaleString()}
                        </p>
                        <p className="text-sm">
                          {log.body.length > 200 ? `${log.body.substring(0, 200)}...` : log.body}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
                {messageLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages sent yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 