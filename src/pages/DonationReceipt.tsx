import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

const mockChurch = {
  name: "Shepherd Hub Church",
  logoUrl: "/placeholder.svg", // Update with real logo path
  address: "123 Faith Avenue, City, Country",
  phone: "+123 456 7890",
  email: "info@shepherdhub.org",
  website: "www.shepherdhub.org",
};

// Simulate fetching thank you message from settings
async function fetchThankYouMessage() {
  // Simulate async fetch
  return new Promise<string>(resolve => setTimeout(() => resolve("We deeply appreciate your support and generosity!"), 300));
}

export default function DonationReceipt({ church = mockChurch }: { church?: any }) {
  const { id } = useParams();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [thankYouMessage, setThankYouMessage] = useState<string>("");

  useEffect(() => {
    fetchThankYouMessage().then(msg => setThankYouMessage(msg));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase.from("donations").select("*", { count: "exact" }).eq("id", id).single().then(async ({ data }) => {
      setDonation(data);
      setLoading(false);
      if (data && data.member_id) {
        const { data: memberData } = await supabase.from("members").select("*").eq("id", data.member_id).single();
        setMember(memberData);
      }
    });
  }, [id]);

  const { name, logoUrl, address, phone, email, website } = church;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!donation) return <div className="min-h-screen flex items-center justify-center text-destructive">Donation not found</div>;

  const receiptUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-8 print:bg-white">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-lg p-8 border border-gray-200 print:shadow-none print:border-none print:p-4 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 print:opacity-20 z-0">
          <img src={logoUrl} alt="Watermark" className="h-64 w-64 object-contain" />
        </div>
        {/* Header */}
        <div className="flex flex-col items-center mb-6 relative z-10">
          <img src={logoUrl} alt="Church Logo" className="h-16 mb-2" />
          <h2 className="text-2xl font-bold text-primary mb-1">{name}</h2>
          <div className="text-sm text-gray-500 text-center">{address}</div>
          <div className="text-sm text-gray-500">{phone} | {email} | {website}</div>
        </div>
        {/* Receipt Title */}
        <h3 className="text-xl font-semibold text-center mb-4 border-b pb-2 relative z-10">Donation Receipt</h3>
        {/* Donor Info */}
        <div className="mb-4 relative z-10">
          <div className="flex justify-between text-sm">
            <span><b>Donor Name:</b> {donation.donor_name}</span>
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
            </div>
          )}
        </div>
        {/* Donation Details */}
        <div className="mb-4 border rounded p-4 bg-gray-50 relative z-10">
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
        <div className="text-center my-6 relative z-10">
          <p className="text-lg font-semibold text-primary">{thankYouMessage}</p>
          <p className="text-sm text-gray-500">This receipt acknowledges your contribution. No goods or services were provided in exchange for this donation.</p>
        </div>
        {/* Signature/Stamp Area */}
        <div className="flex flex-row items-end mt-8 mb-2 relative z-10 gap-4">
          <div className="flex-1">
            <div className="w-48 h-10 border-b-2 border-gray-300 mb-1 relative">
              <span className="absolute left-2 bottom-0 text-xs text-gray-400 font-signature italic" style={{ fontFamily: 'cursive' }}>
                Signature
              </span>
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
        <div className="text-xs text-gray-400 text-center border-t pt-2 mt-4 relative z-10">
          {name} &mdash; {address} &mdash; {phone}
          <br />
          {email} | {website}
        </div>
        {/* QR Code */}
        <div className="absolute right-8 bottom-8 flex flex-col items-center print:hidden z-10">
          <QRCode value={receiptUrl} size={72} />
          <span className="text-xs text-gray-400 mt-1">Scan to verify receipt</span>
        </div>
        {/* Print Button */}
        <div className="flex justify-center mt-6 print:hidden relative z-10">
          <Button onClick={() => window.print()} variant="outline">Print Receipt</Button>
        </div>
      </div>
    </div>
  );
} 