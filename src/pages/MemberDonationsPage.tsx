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

  useEffect(() => {
    if (user) fetchDonations();
    // eslint-disable-next-line
  }, [user]);

  const fetchDonations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("member_id", user?.id)
      .order("donation_date", { ascending: false });
    setDonations(data || []);
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