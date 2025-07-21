import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Calendar, Download, BarChart3, Repeat, CreditCard, PiggyBank, HandCoins, Gift, Landmark, Coins, HelpCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { DonationReceiptModal } from "@/components/donations/DonationReceiptModal";
import { useDashboardStore } from "@/hooks/use-dashboard-store";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/components/auth/AuthContext";
import { useReactToPrint } from "react-to-print";

interface Donation {
  id: string;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  amount: number;
  donation_type: string;
  payment_method: string;
  donation_date: string;
  reference_number?: string;
  is_recurring: boolean;
  notes?: string;
}

// Donation type and payment method options (declare once at the top)
const donationTypes = [
  "Tithe", "Offering", "Building", "Thanksgiving", "Prophetic Seed", "Pledge", "Others"
];
const paymentMethods = [
  "Cash", "Mobile Money", "Cheque", "Bank Transfer", "POS", "Other"
];

const donationTypeIcons: Record<string, JSX.Element> = {
  Tithe: <Landmark className="inline h-4 w-4 mr-1 text-indigo-500" />, // Example
  Offering: <HandCoins className="inline h-4 w-4 mr-1 text-green-500" />, 
  Building: <PiggyBank className="inline h-4 w-4 mr-1 text-yellow-500" />, 
  Thanksgiving: <Gift className="inline h-4 w-4 mr-1 text-pink-500" />, 
  "Prophetic Seed": <Coins className="inline h-4 w-4 mr-1 text-purple-500" />, 
  Pledge: <CreditCard className="inline h-4 w-4 mr-1 text-blue-500" />, 
  Others: <HelpCircle className="inline h-4 w-4 mr-1 text-gray-400" />
};
const paymentMethodIcons: Record<string, JSX.Element> = {
  Cash: <Coins className="inline h-4 w-4 mr-1 text-yellow-600" />, 
  "Mobile Money": <CreditCard className="inline h-4 w-4 mr-1 text-green-600" />, 
  Cheque: <CreditCard className="inline h-4 w-4 mr-1 text-blue-600" />, 
  "Bank Transfer": <Landmark className="inline h-4 w-4 mr-1 text-indigo-600" />, 
  POS: <CreditCard className="inline h-4 w-4 mr-1 text-pink-600" />, 
  Other: <HelpCircle className="inline h-4 w-4 mr-1 text-gray-400" />
};

export function DonationsList() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoleLoading, setUserRoleLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove local filter/search state
  // const [searchTerm, setSearchTerm] = useState("");
  // const [typeFilter, setTypeFilter] = useState("all");
  // const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState<keyof Donation | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    member_id: "",
    donor_name: "",
    donor_email: "",
    amount: "",
    donation_type: "",
    payment_method: "",
    donation_date: "",
    reference_number: "",
    is_recurring: false,
    notes: "",
  });
  const [members, setMembers] = useState<any[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);
  const [trendView, setTrendView] = useState<'monthly' | 'yearly'>('monthly');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (addOpen) {
      supabase.from("members").select("id, first_name, last_name, email").then(({ data }) => setMembers(data || []));
    }
  }, [addOpen]);

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setUserRoleLoading(true);
      supabase.from("profiles").select("role").eq("user_id", user.id).single().then(({ data }) => {
        setUserRole(data?.role || null);
      }).then(() => setUserRoleLoading(false));
    } else {
      setUserRole(null);
      setUserRoleLoading(false);
    }
  }, [user?.id]);

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

  // Zustand store for filters
  const { filters, setTypes, setMethods, setDateRange, setSearch, resetFilters } = useDashboardStore();

  // For date picker UI
  const [datePicker, setDatePicker] = useState<DateRange | undefined>(undefined);

  // Unique types and payment methods for filters
  const uniqueDonationTypes = Array.from(new Set(donations.map(d => d.donation_type))).filter(Boolean);
  const uniquePaymentMethods = Array.from(new Set(donations.map(d => d.payment_method))).filter(Boolean);

  // --- Filtering ---
  let filteredDonations = donations.filter(donation => {
    // Date range filter
    let inDateRange = true;
    if (filters.dateRange.start && filters.dateRange.end) {
      const date = new Date(donation.donation_date);
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      inDateRange = date >= start && date <= end;
    }
    // Multi-select type/method
    const matchesType = filters.types.length === 0 || filters.types.includes(donation.donation_type);
    const matchesMethod = filters.methods.length === 0 || filters.methods.includes(donation.payment_method);
    // Live search (across donor fields)
    const search = filters.search.toLowerCase();
    const matchesSearch =
      donation.donor_name.toLowerCase().includes(search) ||
      (donation.donor_email || "").toLowerCase().includes(search) ||
      (donation.donor_phone || "").toLowerCase().includes(search) ||
      (donation.reference_number || "").toLowerCase().includes(search);
    return inDateRange && matchesType && matchesMethod && matchesSearch;
  });

  if (sortBy) {
    filteredDonations = [...filteredDonations].sort((a, b) => {
      if (sortDir === "asc") {
        if (a[sortBy]! < b[sortBy]!) return -1;
        if (a[sortBy]! > b[sortBy]!) return 1;
        return 0;
      } else {
        if (a[sortBy]! > b[sortBy]!) return -1;
        if (a[sortBy]! < b[sortBy]!) return 1;
        return 0;
      }
    });
  }

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + Number(donation.amount), 0);
  const numberOfDonations = filteredDonations.length;
  const averageDonation = numberOfDonations > 0 ? totalAmount / numberOfDonations : 0;
  // Compute top donor by total amount
  const donorTotals: Record<string, number> = {};
  filteredDonations.forEach(donation => {
    if (!donorTotals[donation.donor_name]) donorTotals[donation.donor_name] = 0;
    donorTotals[donation.donor_name] += Number(donation.amount);
  });
  let topDonor = null;
  let topDonorAmount = 0;
  for (const [name, amount] of Object.entries(donorTotals)) {
    if (amount > topDonorAmount) {
      topDonor = name;
      topDonorAmount = amount;
    }
  }

  // --- Chart Data Preparation ---
  // Group donations by month for trends
  const monthlyTotals: Record<string, number> = {};
  filteredDonations.forEach(donation => {
    const date = new Date(donation.donation_date);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!monthlyTotals[month]) monthlyTotals[month] = 0;
    monthlyTotals[month] += Number(donation.amount);
  });
  const trendsData = Object.entries(monthlyTotals).map(([month, total]) => ({ month, total }));

  // Group donations by year for yearly trends
  const yearlyTotals: Record<string, number> = {};
  filteredDonations.forEach(donation => {
    const date = new Date(donation.donation_date);
    const year = date.getFullYear();
    if (!yearlyTotals[year]) yearlyTotals[year] = 0;
    yearlyTotals[year] += Number(donation.amount);
  });
  const yearlyTrendsData = Object.entries(yearlyTotals).map(([year, total]) => ({ year, total }));

  // Pie chart for donation type breakdown
  const typeTotals: Record<string, number> = {};
  filteredDonations.forEach(donation => {
    if (!typeTotals[donation.donation_type]) typeTotals[donation.donation_type] = 0;
    typeTotals[donation.donation_type] += Number(donation.amount);
  });
  const pieData = Object.entries(typeTotals).map(([type, value]) => ({ name: type, value }));
  const pieColors = ["#6366f1", "#10b981", "#f59e42", "#ef4444", "#a21caf", "#0ea5e9", "#fbbf24", "#14b8a6"];

  // CSV Export
  function exportCSV() {
    if (userRole !== 'admin') {
      toast({ title: "Access Denied", description: "Only admins can export donations.", variant: "destructive" });
      return;
    }
    const headers = [
      "Donor Name","Donor Email","Amount","Donation Type","Payment Method","Donation Date","Reference Number","Recurring","Notes"
    ];
    const rows = filteredDonations.map(d => [
      d.donor_name,
      d.donor_email || "",
      d.amount,
      d.donation_type,
      d.payment_method,
      d.donation_date,
      d.reference_number || "",
      d.is_recurring ? "Yes" : "No",
      d.notes ? d.notes.replace(/\n/g, " ") : ""
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Fundraising goal (placeholder)
  const FUNDRAISING_GOAL = 10000; // Example: $10,000
  const fundraisingProgress = totalAmount / FUNDRAISING_GOAL;

  // Most Frequent Giver (by count)
  const donorCounts: Record<string, number> = {};
  filteredDonations.forEach(donation => {
    if (!donorCounts[donation.donor_name]) donorCounts[donation.donor_name] = 0;
    donorCounts[donation.donor_name] += 1;
  });
  let mostFrequentGiver = null;
  let mostFrequentGiverCount = 0;
  for (const [name, count] of Object.entries(donorCounts)) {
    if (count > mostFrequentGiverCount) {
      mostFrequentGiver = name;
      mostFrequentGiverCount = count;
    }
  }

  // Recurring vs One-time
  const recurringCount = filteredDonations.filter(d => d.is_recurring).length;
  const oneTimeCount = filteredDonations.length - recurringCount;
  const recurringPercent = filteredDonations.length > 0 ? Math.round(100 * recurringCount / filteredDonations.length) : 0;
  const oneTimePercent = 100 - recurringPercent;

  // % Growth from previous month
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const thisMonthTotal = filteredDonations.filter(d => {
    const date = new Date(d.donation_date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).reduce((sum, d) => sum + Number(d.amount), 0);
  const lastMonthTotal = filteredDonations.filter(d => {
    const date = new Date(d.donation_date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  }).reduce((sum, d) => sum + Number(d.amount), 0);
  const growthPercent = lastMonthTotal === 0 ? 100 : Math.round(100 * (thisMonthTotal - lastMonthTotal) / lastMonthTotal);
  const growthUp = thisMonthTotal >= lastMonthTotal;

  async function handleDeleteDonation() {
    if (userRole !== 'admin' || !deletingDonation) {
      toast({ title: "Access Denied", description: "Only admins can delete donations.", variant: "destructive" });
      setDeleteDialogOpen(false);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("donations").delete().eq("id", deletingDonation.id);
    setLoading(false);
    setDeleteDialogOpen(false);
    setDeletingDonation(null);
    if (error) {
      toast({ title: "Error", description: "Failed to delete donation.", variant: "destructive" });
    } else {
      fetchDonations();
      toast({ title: "Donation deleted", description: "Donation was deleted successfully." });
    }
  }

  const handlePrint = useReactToPrint({
    contentRef: dashboardRef,
    documentTitle: "DonationsDashboard",
  });

  if (loading) {
    return <div className="p-6">Loading donations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Donations</h1>
        <div className="flex gap-2">
          {userRoleLoading ? (
            <div className="flex gap-2">
              <Button variant="outline" disabled className="animate-pulse w-28 h-10" />
              <Button variant="outline" disabled className="animate-pulse w-36 h-10" />
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow animate-pulse w-36 h-10" disabled />
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={exportCSV} title="Export CSV" disabled={userRole !== 'admin'}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
              <Button variant="outline" onClick={handlePrint} title="Download PDF" disabled={userRole !== 'admin'}>
                <BarChart3 className="h-4 w-4 mr-2" /> Download PDF
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow" onClick={() => setAddOpen(true)} disabled={userRole !== 'admin'}>
                <Plus className="h-4 w-4 mr-2" /> Add Donation
              </Button>
            </>
          )}
        </div>
      </div>

      <div ref={dashboardRef} className="print:bg-white print:text-black">
        {/* New Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Frequent Giver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{mostFrequentGiver || "-"}</div>
              <div className="text-xs text-muted-foreground">{mostFrequentGiverCount} donations</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recurring vs One-time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold">{recurringCount}</span>
                <span className="text-xs text-muted-foreground">Recurring</span>
                <span className="text-gray-400">/</span>
                <span className="text-blue-600 font-bold">{oneTimeCount}</span>
                <span className="text-xs text-muted-foreground">One-time</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${recurringPercent}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{recurringPercent}% recurring</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth from Last Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center gap-2 ${growthUp ? 'text-green-600' : 'text-red-600'}`}>{growthUp ? '▲' : '▼'} {Math.abs(growthPercent)}%</div>
              <div className="text-xs text-muted-foreground">${lastMonthTotal.toFixed(2)} → ${thisMonthTotal.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fundraising Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">${totalAmount.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">/ ${FUNDRAISING_GOAL.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, Math.round(fundraisingProgress * 100))}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{Math.min(100, Math.round(fundraisingProgress * 100))}% of goal</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-md rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Donation Trends</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={trendView === 'monthly' ? 'default' : 'outline'} onClick={() => setTrendView('monthly')}>Monthly</Button>
                  <Button size="sm" variant={trendView === 'yearly' ? 'default' : 'outline'} onClick={() => setTrendView('yearly')}>Yearly</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendView === 'monthly' ? trendsData : yearlyTrendsData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <XAxis dataKey={trendView === 'monthly' ? 'month' : 'year'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#e0e7ff', opacity: 0.2 }} />
                  <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-white shadow-md rounded-xl">
            <CardHeader>
              <CardTitle>Donation Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-indigo-100 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-100 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Number of Donations</CardTitle>
              <Badge className="bg-primary/10 text-primary">#</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{numberOfDonations}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-100 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
              <Badge className="bg-accent/10 text-accent">AVG</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageDonation.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-100 to-white shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Donor</CardTitle>
              <Badge className="bg-success/10 text-success">★</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{topDonor || "-"}</div>
              <div className="text-xs text-muted-foreground">${topDonorAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search donors, email, phone, ref..."
              value={filters.search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Multi-select for types */}
          <Select
            value={filters.types.length === 0 ? "all" : undefined}
            onValueChange={val => setTypes(val === "all" ? [] : [val])}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Donation Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueDonationTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Multi-select for methods */}
          <Select
            value={filters.methods.length === 0 ? "all" : undefined}
            onValueChange={val => setMethods(val === "all" ? [] : [val])}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {uniquePaymentMethods.map(method => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Date range picker (placeholder UI) */}
          <Input
            type="date"
            value={filters.dateRange.start || ""}
            onChange={e => setDateRange(e.target.value, filters.dateRange.end)}
            className="w-36"
          />
          <span className="mx-1">to</span>
          <Input
            type="date"
            value={filters.dateRange.end || ""}
            onChange={e => setDateRange(filters.dateRange.start, e.target.value)}
            className="w-36"
          />
          <Button variant="ghost" onClick={resetFilters}>Reset</Button>
        </div>

        {/* Modern Table */}
        <div className="overflow-x-auto rounded-lg border bg-background mt-4">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left cursor-pointer" onClick={() => { setSortBy("donor_name"); setSortDir(sortBy === "donor_name" && sortDir === "asc" ? "desc" : "asc"); }}>Donor {sortBy === "donor_name" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                <th className="px-4 py-2 text-left cursor-pointer" onClick={() => { setSortBy("amount"); setSortDir(sortBy === "amount" && sortDir === "asc" ? "desc" : "asc"); }}>Amount {sortBy === "amount" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                <th className="px-4 py-2 text-left cursor-pointer" onClick={() => { setSortBy("donation_date"); setSortDir(sortBy === "donation_date" && sortDir === "asc" ? "desc" : "asc"); }}>Date {sortBy === "donation_date" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                <th className="px-4 py-2 text-left cursor-pointer" onClick={() => { setSortBy("donation_type"); setSortDir(sortBy === "donation_type" && sortDir === "asc" ? "desc" : "asc"); }}>Type {sortBy === "donation_type" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                <th className="px-4 py-2 text-left cursor-pointer" onClick={() => { setSortBy("payment_method"); setSortDir(sortBy === "payment_method" && sortDir === "asc" ? "desc" : "asc"); }}>Payment {sortBy === "payment_method" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Recurring</th>
                <th className="px-4 py-2 text-left">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDonations.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">No donations found</td>
                </tr>
              )}
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className={`hover:bg-muted/50 transition cursor-pointer ${selectedDonation?.id === donation.id ? 'bg-muted/30' : ''}`} onClick={() => { setSelectedDonation(donation); setDetailsOpen(true); }}>
                  <td className="px-4 py-2 font-bold text-lg">{donation.donor_name}</td>
                  <td className="px-4 py-2 text-primary font-bold">${Number(donation.amount).toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(donation.donation_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 flex items-center gap-1">{donationTypeIcons[donation.donation_type] || <HelpCircle className="h-4 w-4 mr-1 text-gray-400" />}<span className="font-medium">{donation.donation_type}</span></td>
                  <td className="px-4 py-2 flex items-center gap-1">{paymentMethodIcons[donation.payment_method] || <HelpCircle className="h-4 w-4 mr-1 text-gray-400" />}<span className="font-medium">{donation.payment_method}</span></td>
                  <td className="px-4 py-2 text-xs">{donation.reference_number || "-"}</td>
                  <td className="px-4 py-2">{donation.is_recurring ? <span className="inline-flex items-center gap-1 text-green-600 font-semibold"><Repeat className="h-4 w-4" /> Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedDonationId(donation.id);
                        setReceiptOpen(true);
                      }}
                    >
                      View Receipt
                    </Button>
                    {userRole === 'admin' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="ml-2"
                        onClick={e => {
                          e.stopPropagation();
                          setDeletingDonation(donation);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donation Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>Full details for this donation record.</DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-2">
              <div><b>Donor:</b> {selectedDonation.donor_name}</div>
              {selectedDonation.donor_email && <div><b>Email:</b> {selectedDonation.donor_email}</div>}
              <div><b>Amount:</b> ${Number(selectedDonation.amount).toFixed(2)}</div>
              <div><b>Date:</b> {new Date(selectedDonation.donation_date).toLocaleDateString()}</div>
              <div><b>Type:</b> {selectedDonation.donation_type}</div>
              <div><b>Payment Method:</b> {selectedDonation.payment_method}</div>
              <div><b>Reference:</b> {selectedDonation.reference_number || '-'}</div>
              <div><b>Recurring:</b> {selectedDonation.is_recurring ? 'Yes' : 'No'}</div>
              {selectedDonation.notes && <div><b>Notes:</b> <span className="bg-muted p-2 rounded inline-block">{selectedDonation.notes}</span></div>}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Donation Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Donation</DialogTitle>
            <DialogDescription>Fill in the details to add a new donation record.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={async e => {
            e.preventDefault();
            if (userRole !== 'admin') {
              toast({ title: "Access Denied", description: "Only admins can add donations.", variant: "destructive" });
              return;
            }
            const { member_id, amount, donation_date, donation_type, payment_method } = addForm;
            if (!member_id || !amount || !donation_date || !donation_type || !payment_method) return;
            setLoading(true);
            const { error } = await supabase.from("donations").insert([
              { ...addForm, amount: Number(addForm.amount) }
            ]);
            setLoading(false);
            if (error) {
              toast({ title: "Error", description: error.message, variant: "destructive" });
            } else {
              setAddOpen(false);
              setAddForm({
                member_id: "",
                donor_name: "",
                donor_email: "",
                amount: "",
                donation_type: "",
                payment_method: "",
                donation_date: "",
                reference_number: "",
                is_recurring: false,
                notes: "",
              });
              fetchDonations();
              toast({ title: "Donation added", description: "Donation was added successfully." });
            }
          }}>
            <Select value={addForm.member_id} onValueChange={val => {
              const member = members.find(m => m.id === val);
              setAddForm(f => ({ ...f, member_id: val, donor_name: member ? `${member.first_name} ${member.last_name}` : "", donor_email: member?.email || "" }));
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Member" />
              </SelectTrigger>
              <SelectContent>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name} {m.email ? `(${m.email})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input placeholder="Donor Name (auto-filled)" value={addForm.donor_name} onChange={e => setAddForm(f => ({ ...f, donor_name: e.target.value }))} required disabled />
              <Input placeholder="Email (auto-filled)" value={addForm.donor_email} onChange={e => setAddForm(f => ({ ...f, donor_email: e.target.value }))} disabled />
            </div>
            <div className="flex gap-2">
              <Input type="number" placeholder="Amount" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} required min={0.01} step={0.01} />
              <Input type="date" placeholder="Date" value={addForm.donation_date} onChange={e => setAddForm(f => ({ ...f, donation_date: e.target.value }))} required />
            </div>
            <div className="flex gap-2">
              <Select value={addForm.donation_type} onValueChange={val => setAddForm(f => ({ ...f, donation_type: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Donation Type" />
                </SelectTrigger>
                <SelectContent>
                  {donationTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={addForm.payment_method} onValueChange={val => setAddForm(f => ({ ...f, payment_method: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Reference Number (optional)" value={addForm.reference_number} onChange={e => setAddForm(f => ({ ...f, reference_number: e.target.value }))} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_recurring" checked={addForm.is_recurring} onChange={e => setAddForm(f => ({ ...f, is_recurring: e.target.checked }))} />
              <label htmlFor="is_recurring">Recurring</label>
            </div>
            <Input placeholder="Notes (optional)" value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} />
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Donation"}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Donation Receipt Modal */}
      {selectedDonationId && (
        <DonationReceiptModal
          donationId={selectedDonationId}
          open={receiptOpen}
          onOpenChange={open => {
            setReceiptOpen(open);
            if (!open) setSelectedDonationId(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Donation</DialogTitle>
            <DialogDescription>Are you sure you want to delete this donation? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="font-bold">{deletingDonation?.donor_name}</div>
            <div className="text-xs text-muted-foreground">Amount: ${deletingDonation?.amount?.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Date: {deletingDonation && new Date(deletingDonation.donation_date).toLocaleDateString()}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDonation} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}