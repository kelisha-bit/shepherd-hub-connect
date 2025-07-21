import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import { Crown, Gift, CalendarHeart } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

const mockChurch = {
  name: "Greater Works City Church Int.",
  logoUrl: "/church-logo.png",
  address: "123 Faith Avenue, Accra, Ghana",
  phone: "+233 54 387 1470",
  email: "info@greaterworkscity.org",
  website: "www.greaterworkscity.org",
};

async function fetchThankYouMessage() {
  return new Promise<string>(resolve => setTimeout(() => resolve("We deeply appreciate your support and generosity!"), 300));
}

export function DonationReceiptModal({ donationId, open, onOpenChange, church = mockChurch, topDonorName }: {
  donationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church?: any;
  topDonorName?: string;
}) {
  type Donation = Database["public"]["Tables"]["donations"]["Row"];
  type Member = Database["public"]["Tables"]["members"]["Row"];
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThankYouMessage().then(msg => setThankYouMessage(msg));
  }, []);

  useEffect(() => {
    if (!open || !donationId) return;
    setLoading(true);
    supabase.from("donations").select("*").eq("id", donationId).single().then(async ({ data }) => {
      setDonation(data);
      setLoading(false);
      const memberId = data?.member_id;
      if (data && memberId) {
        const { data: memberData } = await supabase.from("members").select("*").eq("id", memberId).single();
        setMember(memberData);
      }
    });
  }, [open, donationId]);

  const { name, logoUrl, address, phone, email, website } = church;
  const receiptUrl = typeof window !== "undefined" ? window.location.origin + `/donations/receipt/${donationId}` : "";

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `DonationReceipt-${donationId}`,
  });

  // Placeholder for birthday (in real app, fetch from member)
  const donorBirthday = member?.date_of_birth || null; // e.g., "1990-05-10"
  // const donorAnniversary = member?.anniversary || null; // Remove if not in type

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-none max-h-none md:max-w-xl md:max-h-[90vh] p-0 overflow-auto bg-gradient-to-br from-blue-50 to-green-50">
        <DialogHeader className="print:hidden">
          <DialogTitle>Donation Receipt</DialogTitle>
          <DialogDescription>Official receipt for this donation</DialogDescription>
        </DialogHeader>
        <div ref={receiptRef} className="relative bg-white rounded-lg p-2 md:p-6 pt-2 overflow-auto h-full">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 print:opacity-20 z-0">
            <img src={logoUrl} alt="Watermark" className="h-64 w-64 object-contain" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">Loading...</div>
          ) : !donation ? (
            <div className="flex items-center justify-center min-h-[300px] text-destructive">Donation not found</div>
          ) : (
            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                <img src={logoUrl} alt="Church Logo" className="h-16 mb-2" />
                <h2 className="text-2xl font-bold text-primary mb-1">{name}</h2>
                <div className="text-sm text-gray-500 text-center">{address}</div>
                <div className="text-sm text-gray-500">{phone} | {email} | {website}</div>
              </div>
              {/* Donor Info */}
              <div className="mb-4">
                <div className="flex justify-between text-sm">
                  <span><b>Donor Name:</b> {donation.donor_name}
                    {topDonorName && donation.donor_name === topDonorName && (
                      <span className="inline-flex items-center ml-2 text-yellow-500 font-bold"><Crown className="h-4 w-4 mr-1" />Top Donor</span>
                    )}
                  </span>
                  {donation.donor_email && <span><b>Email:</b> {donation.donor_email}</span>}
                </div>
                {donation.donor_phone && (
                  <div className="text-sm"><b>Phone:</b> {donation.donor_phone}</div>
                )}
                {/* Member Details */}
                {member && (
                  <div className="mt-2 text-xs bg-muted/30 p-2 rounded">
                    <div><b>Member:</b> {member.first_name} {member.last_name}</div>
                    {member.email && <div><b>Email:</b> {member.email}</div>}
                    {member.phone_number && <div><b>Phone:</b> {member.phone_number}</div>}
                    {donorBirthday && (
                      <div className="flex items-center gap-1 text-pink-500"><Gift className="h-4 w-4" /> Birthday: {new Date(donorBirthday).toLocaleDateString()}</div>
                    )}
                    {/* Anniversary field removed for type safety */}
                  </div>
                )}
              </div>
              {/* Donation Details */}
              <div className="mb-4 border rounded p-4 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <span><b>Amount:</b></span>
                  <span className="text-lg font-bold text-green-700">${Number(donation.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span><b>Type:</b> {donation.donation_type}</span>
                  <span><b>Payment:</b> {donation.payment_method}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span><b>Date:</b> {new Date(donation.donation_date).toLocaleDateString()}</span>
                  {donation.reference_number && <span><b>Ref:</b> {donation.reference_number}</span>}
                </div>
                {donation.notes && (
                  <div className="text-xs text-gray-600 mt-2"><b>Notes:</b> {donation.notes}</div>
                )}
              </div>
              {/* Thank You */}
              <div className="text-center my-6">
                <p className="text-lg font-semibold text-primary">
                  {`Thank you${donation.donor_name ? ", " + donation.donor_name : ""}, for your generosity!`}
                </p>
                <p className="text-sm text-gray-500">This receipt acknowledges your contribution. No goods or services were provided in exchange for this donation.</p>
              </div>
              {/* Signature/Stamp Area */}
              <div className="flex flex-row items-end mt-8 mb-2 gap-4">
                <div className="flex-1">
                  <div className="w-48 h-10 border-b-2 border-gray-300 mb-1 relative flex items-end">
                    <img
                      src="/signature.png"
                      alt="Authorized Signature"
                      className="h-8 object-contain absolute left-2 bottom-0"
                      style={{ maxWidth: "180px" }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">Authorized Signature</span>
                </div>
                {/* Digital Stamp Placeholder */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-400 opacity-60">
                    Stamp
                  </div>
                  <span className="text-xs text-gray-400 mt-1">Church Stamp</span>
                </div>
              </div>
              {/* Footer */}
              <div className="text-xs text-gray-400 text-center border-t pt-2 mt-4">
                {name} &mdash; {address} &mdash; {phone}
                <br />
                {email} | {website}
              </div>
              {/* QR Code - Temporarily commented out */}
              <div className="flex justify-center mt-4">
                <QRCode value={receiptUrl} size={72} />
              </div>
              {/* Print & PDF Buttons */}
              <div className="flex justify-center gap-2 mt-6 print:hidden">
                <Button onClick={handlePrint} variant="outline">Download as PDF</Button>
                <Button onClick={() => window.print()} variant="outline">Print Receipt</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 