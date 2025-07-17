import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  donor_name: string;
  donor_email?: string;
  amount: number;
  donation_type: string;
  payment_method: string;
  donation_date: string;
  reference_number?: string;
  is_recurring: boolean;
  notes?: string;
}

export function DonationsList() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("donation_date", { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch donations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((donation) =>
    donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + Number(donation.amount), 0);

  if (loading) {
    return <div className="p-6">Loading donations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Donations</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Donation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search donors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredDonations.map((donation) => (
          <Card key={donation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{donation.donor_name}</CardTitle>
                <div className="text-2xl font-bold text-primary">
                  ${Number(donation.amount).toFixed(2)}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{donation.donation_type}</Badge>
                <Badge variant="secondary">{donation.payment_method}</Badge>
                {donation.is_recurring && (
                  <Badge variant="default">Recurring</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(donation.donation_date).toLocaleDateString()}</span>
              </div>
              
              {donation.reference_number && (
                <div className="text-sm">
                  <span className="font-medium">Reference: </span>
                  {donation.reference_number}
                </div>
              )}
              
              {donation.notes && (
                <div className="text-sm bg-muted p-2 rounded">
                  {donation.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDonations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No donations found</p>
        </div>
      )}
    </div>
  );
}