import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";

export default function TestAnnouncementPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const testDatabaseConnection = async () => {
    setTesting(true);
    console.log("Testing database connection...");
    
    try {
      // Test 1: Check if we can connect to Supabase
      console.log("Test 1: Checking Supabase connection...");
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log("Session:", session);
      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      // Test 2: Check if communications table exists and we can read from it
      console.log("Test 2: Checking communications table read access...");
      const { data: readData, error: readError } = await supabase
        .from("communications")
        .select("*")
        .limit(1);
      
      console.log("Read test result:", readData);
      if (readError) {
        console.error("Read error:", readError);
      }

      // Test 3: Try to insert a test record
      console.log("Test 3: Testing insert operation...");
      const testData = {
        subject: subject || "Test Announcement",
        message: message || "This is a test announcement message",
        communication_type: "announcement",
        target_audience: "all_members",
        status: "draft",
        sent_date: null,
        sent_by: user?.id || null,
      };

      console.log("Attempting to insert:", testData);
      const { data: insertData, error: insertError } = await supabase
        .from("communications")
        .insert([testData])
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        toast({
          title: "Insert Failed",
          description: `Error: ${insertError.message}`,
          variant: "destructive",
        });
      } else {
        console.log("Insert successful:", insertData);
        toast({
          title: "Success!",
          description: "Test announcement created successfully",
        });
      }

    } catch (error) {
      console.error("Test failed:", error);
      toast({
        title: "Test Failed",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Test Announcement Form</h1>
        <p className="text-muted-foreground">Debug form submission issues</p>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <label htmlFor="subject">Subject (optional for test)</label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Test Subject"
          />
        </div>

        <div>
          <label htmlFor="message">Message (optional for test)</label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Test Message"
            rows={3}
          />
        </div>

        <Button 
          onClick={testDatabaseConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? "Testing..." : "Test Database Connection & Insert"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>This page will test:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Database connection</li>
          <li>Authentication status</li>
          <li>Read access to communications table</li>
          <li>Insert operation to communications table</li>
        </ul>
        <p className="mt-2">Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
}
