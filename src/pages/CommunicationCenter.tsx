import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const mockTemplates = [
  { id: 1, name: "Welcome Email", subject: "Welcome to the Church!", body: "Dear {{name}}, welcome!" },
  { id: 2, name: "Event Reminder", subject: "Upcoming Event Reminder", body: "Don't forget about {{event}}!" },
];

const mockLogs = [
  { id: 1, recipient: "john@example.com", type: "Email", subject: "Welcome to the Church!", status: "Sent", date: "2024-07-20" },
  { id: 2, recipient: "+1234567890", type: "SMS", subject: "Event Reminder", status: "Sent", date: "2024-07-19" },
];

export default function CommunicationCenter() {
  const [recipientType, setRecipientType] = useState("all");
  const [templateId, setTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("email");

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const template = mockTemplates.find(t => t.id.toString() === id);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Communication Center</h1>
      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="font-medium">Recipient</label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="font-medium">Channel</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="font-medium">Template</label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
              <SelectContent>
                {mockTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-medium">Subject</label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div>
            <label className="font-medium">Message</label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Type your message..." />
          </div>
          <Button>Send Message</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Recipient</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Subject</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockLogs.map(log => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="p-2">{log.date}</td>
                    <td className="p-2">{log.recipient}</td>
                    <td className="p-2">{log.type}</td>
                    <td className="p-2">{log.subject}</td>
                    <td className="p-2">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 