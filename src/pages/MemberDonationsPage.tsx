import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, DollarSign } from "lucide-react";
import { DonationReceiptModal } from "@/components/donations/DonationReceiptModal";

export default function MemberDonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      findMemberId();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (memberId || memberEmail) {
      fetchDonations();
    }
  }, [memberId, memberEmail]);

  const findMemberId = async () => {
    console.log("MemberDonationsPage: Finding member ID for user:", user?.email);
    setMemberEmail(user?.email || null);
    
    // Try to find member by email first
    const { data: emailData, error: emailError } = await supabase
      .from("members")
      .select("id, email")
      .eq("email", user?.email)
      .maybeSingle();
    
    console.log("MemberDonationsPage: Member by email:", emailData, "Error:", emailError);
    
    if (emailData) {
      console.log("MemberDonationsPage: Found member by email, ID:", emailData.id);
      setMemberId(emailData.id);
      return;
    }
    
    // If not found by email, try by auth ID
    const { data: idData, error: idError } = await supabase
      .from("members")
      .select("id, email")
      .eq("id", user?.id)
      .maybeSingle();
    
    console.log("MemberDonationsPage: Member by auth ID:", idData, "Error:", idError);
    
    if (idData) {
      console.log("MemberDonationsPage: Found member by auth ID:", idData.id);
      setMemberId(idData.id);
      return;
    }
    
    console.log("MemberDonationsPage: Could not find member ID, using auth ID as fallback");
    setMemberId(user?.id || null);
  };

  const fetchDonations = async () => {
    setLoading(true);
    console.log("MemberDonationsPage: Fetching donations for member ID:", memberId);
    
    let allDonations: any[] = [];
    
    // Try to fetch by member_id if available
    if (memberId) {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("member_id", memberId)
        .order("donation_date", { ascending: false });
      
      console.log("MemberDonationsPage: Donations by member_id:", data, "Error:", error);
      
      if (!error && data && data.length > 0) {
        allDonations = [...data];
      }
    }
    
    // Also try to fetch by donor_email if available
    if (memberEmail) {
      const { data: emailData, error: emailError } = await supabase
        .from("donations")
        .select("*")
        .eq("donor_email", memberEmail)
        .order("donation_date", { ascending: false });
      
      console.log("MemberDonationsPage: Donations by donor_email:", emailData, "Error:", emailError);
      
      if (!emailError && emailData && emailData.length > 0) {
        // Combine with member_id results, avoiding duplicates
        const existingIds = new Set(allDonations.map(d => d.id));
        const newDonations = emailData.filter(d => !existingIds.has(d.id));
        allDonations = [...allDonations, ...newDonations];
      }
    }
    
    // Sort combined results by date
    allDonations.sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());
    
    console.log("MemberDonationsPage: Combined donations:", allDonations);
    setDonations(allDonations);
    setLoading(false);
  };

  return (
    <div className="py-8 px-4 md:px-12 lg:px-32">
      <Card>
        <CardHeader>
          <CardTitle>My Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : donations.length === 0 ? (
            <div className="text-muted-foreground">No donations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Payment</th>
                    <th className="text-left p-2">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-b last:border-0">
                      <td className="p-2">{new Date(donation.donation_date).toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge variant="outline">{donation.donation_type}</Badge>
                      </td>
                      <td className="p-2 font-semibold text-green-700">${Number(donation.amount).toFixed(2)}</td>
                      <td className="p-2">{donation.payment_method}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" onClick={() => setReceiptId(donation.id)}>
                          <Download className="inline h-4 w-4 mr-1" />Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <DonationReceiptModal donationId={receiptId || ""} open={!!receiptId} onOpenChange={() => setReceiptId(null)} />
    </div>
  );
}