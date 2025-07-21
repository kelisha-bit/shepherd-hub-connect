import { useRef } from "react";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";

// --- Church Info (customize as needed) ---
const CHURCH = {
  name: "Greater Works City Church Int.",
  logoUrl: "/church-logo.png",
  address: "123 Faith Avenue, Accra, Ghana",
  phone: "+233 54 387 1470",
  email: "info@greaterworkscitychurch.org",
  website: "www.greaterworkscitychurch.org",
  registration: "Reg. No. 1234567890", // Optional
};

// --- Example Donation Data (replace with real data/props) ---
const EXAMPLE_DONATION = {
  donor_name: "Amina Bukari",
  donor_email: "amina@church.com",
  donor_phone: "+233256922448",
  amount: 50,
  donation_type: "Tithe",
  payment_method: "Cash",
  donation_date: "2025-07-20",
  reference_number: "REF123456",
  notes: "God bless you!",
};

export default function ModernDonationReceipt({
  donation = EXAMPLE_DONATION,
  church = CHURCH,
  thankYouMessage = "We deeply appreciate your support and generosity!",
}: {
  donation?: typeof EXAMPLE_DONATION;
  church?: typeof CHURCH;
  thankYouMessage?: string;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `DonationReceipt-${donation.reference_number || donation.donation_date}`,
  });

  // For QR code (link to online receipt or your website)
  const receiptUrl = typeof window !== "undefined"
    ? window.location.origin + "/donations/receipt/" + (donation.reference_number || "id")
    : "";

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 min-h-screen py-8 font-sans">
      <div
        ref={receiptRef}
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-200 print:shadow-none print:border print:bg-white"
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
          <img src={church.logoUrl} alt="Watermark" className="h-64 w-64 object-contain" />
        </div>
        {/* Header */}
        <div className="flex flex-col items-center mb-6 z-10 relative">
          <img src={church.logoUrl} alt="Church Logo" className="h-20 mb-2 rounded-full shadow" />
          <h2 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">{church.name}</h2>
          <div className="text-sm text-gray-500 text-center">{church.address}</div>
          <div className="text-sm text-gray-500">{church.phone} | {church.email} | {church.website}</div>
          {church.registration && (
            <div className="text-xs text-gray-400 mt-1">{church.registration}</div>
          )}
        </div>
        {/* Receipt Title */}
        <h3 className="text-xl font-semibold text-center mb-4 border-b pb-2 z-10">Donation Receipt</h3>
        {/* Donor Info */}
        <div className="mb-4 z-10">
          <div className="flex justify-between text-sm">
            <span><b>Donor Name:</b> {donation.donor_name}</span>
            {donation.donor_email && <span><b>Email:</b> {donation.donor_email}</span>}
          </div>
          {donation.donor_phone && (
            <div className="text-sm"><b>Phone:</b> {donation.donor_phone}</div>
          )}
        </div>
        {/* Donation Details */}
        <div className="mb-4 border rounded p-4 bg-gray-50 z-10">
          <div className="flex justify-between mb-2">
            <span><b>Amount:</b></span>
            <span className="text-lg font-bold text-green-700">
              {typeof donation.amount === "number"
                ? `GHS ${donation.amount.toFixed(2)}`
                : donation.amount}
            </span>
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
        <div className="text-center my-6 z-10">
          <p className="text-lg font-semibold text-primary">
            Thank you, {donation.donor_name}, for your generosity!
          </p>
          <p className="text-sm text-gray-500">{thankYouMessage}</p>
          <p className="text-xs text-gray-400 mt-2">
            This receipt acknowledges your contribution. No goods or services were provided in exchange for this donation.
          </p>
        </div>
        {/* Signature/Stamp Area */}
        <div className="flex flex-row items-end mt-8 mb-2 z-10 gap-4">
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
          {/* Digital Stamp */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-400 opacity-60">
              {/* Replace with your real stamp image if available */}
              Stamp
            </div>
            <span className="text-xs text-gray-400 mt-1">Church Stamp</span>
          </div>
        </div>
        {/* QR Code */}
        <div className="flex justify-center mt-4 z-10">
          <QRCode value={receiptUrl} size={72} />
        </div>
        {/* Footer */}
        <div className="text-xs text-gray-400 text-center border-t pt-2 mt-4 z-10">
          {church.name} &mdash; {church.address} &mdash; {church.phone}
          <br />
          {church.email} | {church.website}
        </div>
        {/* Print & PDF Buttons */}
        <div className="flex justify-center gap-2 mt-6 print:hidden z-10">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Download as PDF
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
