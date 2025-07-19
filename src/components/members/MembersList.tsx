import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Users,
  BarChart2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { v4 as uuidv4 } from 'uuid';
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

export function MembersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ministryFilter, setMinistryFilter] = useState("all");
  const [members, setMembers] = useState<any[]>([]);
  const [memberDonations, setMemberDonations] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<any | null>(null);
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      ministry: "",
      membership_status: "active",
      address: "",
    },
  });

  const editForm = useForm({
    defaultValues: useMemo(() => editingMember || {}, [editingMember]),
    values: editingMember || {},
    mode: "onChange",
  });

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsMember, setDetailsMember] = useState<any | null>(null);
  const [addPhotoFile, setAddPhotoFile] = useState<File | null>(null);
  const [addPhotoPreview, setAddPhotoPreview] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (editingMember) {
      editForm.reset(editingMember);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMember]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*");
      
      if (!error) {
        setMembers(data || []);
        // Fetch donations for all members
        await fetchMemberDonations(data || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({ title: "Error", description: "Failed to fetch members", variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchMemberDonations = async (membersList: any[]) => {
    try {
      const memberIds = membersList.map(m => m.id);
      const { data: donationsData, error } = await supabase
        .from("donations")
        .select("*")
        .in("member_id", memberIds);

      if (!error && donationsData) {
        const donationsByMember = donationsData.reduce((acc, donation) => {
          if (donation.member_id) {
            if (!acc[donation.member_id]) {
              acc[donation.member_id] = [];
            }
            acc[donation.member_id].push(donation);
          }
          return acc;
        }, {} as Record<string, any[]>);
        
        setMemberDonations(donationsByMember);
      }
    } catch (error) {
      console.error("Error fetching member donations:", error);
    }
  };

  const getMemberDonationStats = (memberId: string) => {
    const donations = memberDonations[memberId] || [];
    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const recentDonations = donations
      .sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime())
      .slice(0, 3);
    
    return {
      totalAmount,
      donationCount: donations.length,
      recentDonations,
      hasDonations: donations.length > 0
    };
  };

  const filteredMembers = members.filter(member => {
    const name = `${member.first_name} ${member.last_name}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || (member.membership_status || "").toLowerCase() === statusFilter;
    const matchesMinistry = ministryFilter === "all" || member.ministry === ministryFilter;
    return matchesSearch && matchesStatus && matchesMinistry;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground";
  };

  // Helper to upload photo and return public URL
  const uploadProfilePhoto = async (file: File, memberId?: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId || uuidv4()}.${fileExt}`;
    const filePath = `members/${fileName}`;
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type,
      });
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      let profile_image_url = values.profile_image_url;
      if (addPhotoFile) {
        try {
          profile_image_url = await uploadProfilePhoto(addPhotoFile);
        } catch (uploadError: any) {
          toast({ title: "Photo Upload Error", description: uploadError.message, variant: "destructive" });
          setLoading(false);
          return;
        }
      }
      // Add membership_date if required
      const { error } = await supabase.from("members").insert([{ ...values, profile_image_url, membership_date: new Date().toISOString() }]);
      if (error) {
        console.error(error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Member added", description: `${values.first_name} ${values.last_name} was added successfully.` });
        setOpen(false);
        form.reset();
        setAddPhotoFile(null);
        setAddPhotoPreview(null);
        fetchMembers();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    try {
      setLoading(true);
      let profile_image_url = values.profile_image_url;
      if (editPhotoFile) {
        profile_image_url = await uploadProfilePhoto(editPhotoFile, editingMember.id);
      }
      const { error } = await supabase.from("members").update({ ...values, profile_image_url }).eq("id", editingMember.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Member updated", description: `${values.first_name} ${values.last_name} was updated successfully.` });
        setEditOpen(false);
        setEditingMember(null);
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        fetchMembers();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    try {
      setLoading(true);
      const { error } = await supabase.from("members").delete().eq("id", deletingMember.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Member deleted", description: `${deletingMember.first_name} ${deletingMember.last_name} was deleted.` });
        setDeleteOpen(false);
        setDeletingMember(null);
        fetchMembers();
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Stats and Demography ---
  const totalMembers = members.length;
  const activeMembers = members.filter(m => (m.membership_status || '').toLowerCase() === 'active').length;
  const inactiveMembers = members.filter(m => (m.membership_status || '').toLowerCase() === 'inactive').length;
  
  // Calculate total donations across all members
  const totalDonations = Object.values(memberDonations).reduce((sum, donations) => 
    sum + donations.reduce((memberSum, d) => memberSum + Number(d.amount || 0), 0), 0
  );

  // Gender distribution for chart
  const genderCounts = members.reduce((acc, m) => {
    const gender = (m.gender || 'Unknown').toLowerCase();
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const genderData = Object.entries(genderCounts).map(([gender, count]) => ({ name: gender.charAt(0).toUpperCase() + gender.slice(1), value: count }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#A28CF6"];

  // No need for chartData as it's not used in the component


  return (
    <div className="space-y-6">
      {/* Stats Cards & Demography Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-900">{totalMembers}</div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-900">{activeMembers}</div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Inactive Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-900">{inactiveMembers}</div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-emerald-900">₵{totalDonations.toLocaleString()}</div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 120 }}>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={40}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground">Manage your church members and their information</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new member. Upload a profile photo if available.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="add-photo-upload" className="cursor-pointer">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={addPhotoPreview || undefined} />
                      <AvatarFallback>+</AvatarFallback>
                    </Avatar>
                  </label>
                  <input
                    id="add-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setAddPhotoFile(file);
                      setAddPhotoPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  {addPhotoFile && <span className="text-xs text-muted-foreground">{addPhotoFile.name}</span>}
                </div>
                <div className="flex gap-2">
                  <FormField name="first_name" control={form.control} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="last_name" control={form.control} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField name="email" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="phone_number" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="ministry" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ministry</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Ministry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men_ministry">Men Ministry</SelectItem>
                          <SelectItem value="youth_ministry">Youth Ministry</SelectItem>
                          <SelectItem value="women_ministry">Women Ministry</SelectItem>
                          <SelectItem value="children_ministry">Children's Ministry</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="membership_status" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="address" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit">Add Member</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ministryFilter} onValueChange={setMinistryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ministry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ministries</SelectItem>
                <SelectItem value="men_ministry">Men Ministry</SelectItem>
                <SelectItem value="youth_ministry">Youth Ministry</SelectItem>
                <SelectItem value="women_ministry">Women Ministry</SelectItem>
                <SelectItem value="children_ministry">Children's Ministry</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Members Grid */}
      <div className="bg-muted/40 rounded-xl p-2 sm:p-4">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading members...</div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => {
              const donationStats = getMemberDonationStats(member.id);
              return (
                <Card key={member.id} className="group hover:shadow-xl transition-all duration-300 border border-border/70 bg-background/90 overflow-hidden">
                  <CardHeader className="pb-3 flex flex-col items-center relative bg-gradient-to-br from-slate-50 to-slate-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setEditingMember(member); setEditOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDetailsMember(member); setDetailsOpen(true); }}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingMember(member); setDeleteOpen(true); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Avatar className="h-20 w-20 mb-3 shadow-lg border-4 border-white">
                      <AvatarImage src={member.profile_image_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-xl">
                        {`${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <CardTitle className="text-xl font-bold text-center text-foreground mb-1">
                      {member.first_name} {member.last_name}
                    </CardTitle>
                    
                    <CardDescription className="text-center text-muted-foreground mb-3">
                      {member.email || <span className="italic text-xs">No email</span>}
                    </CardDescription>
                    
                    <div className="flex gap-2 flex-wrap justify-center">
                      <Badge className={`${getStatusColor(member.membership_status)} font-medium`}>
                        {member.membership_status || "Unknown"}
                      </Badge>
                      {member.ministry && (
                        <Badge variant="outline" className="font-medium">{member.ministry.replace(/_/g, " ")}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span className="truncate">{member.phone_number || <span className="italic">No phone</span>}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="truncate">{member.address || <span className="italic">No address</span>}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>Joined: {member.membership_date ? new Date(member.membership_date).toLocaleDateString() : <span className="italic">Unknown</span>}</span>
                      </div>
                    </div>
                    
                    {/* Donation Statistics */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Donation Summary</span>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                      </div>
                      
                      {donationStats.hasDonations ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Total Amount:</span>
                            <span className="text-sm font-bold text-emerald-600">₵{donationStats.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Donations:</span>
                            <span className="text-sm font-medium text-blue-600">{donationStats.donationCount}</span>
                          </div>
                          
                          {/* Recent Donations */}
                          {donationStats.recentDonations.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground block mb-1">Recent:</span>
                              <div className="space-y-1">
                                {donationStats.recentDonations.map((donation, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">
                                      {new Date(donation.donation_date).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium text-emerald-600">
                                      ₵{Number(donation.amount).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-xs text-muted-foreground italic">No donation records</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => { setDetailsMember(member); setDetailsOpen(true); }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => { setEditingMember(member); setEditOpen(true); }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-14 w-14 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No members found</h3>
            <p className="text-muted-foreground text-center mb-4">
              No members match your current search criteria. Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setMinistryFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      {/* Member Details Side Panel */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-full max-w-full sm:max-w-md">
          {detailsMember && (
            <>
              <SheetHeader>
                <div className="flex flex-col items-center gap-2 mb-2">
                  <Avatar className="h-20 w-20 shadow-md">
                    <AvatarImage src={detailsMember.profile_image_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-2xl">
                      {`${detailsMember.first_name?.[0] || ""}${detailsMember.last_name?.[0] || ""}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <SheetTitle className="text-2xl font-bold text-center">{detailsMember.first_name} {detailsMember.last_name}</SheetTitle>
                  <SheetDescription className="text-center text-muted-foreground">{detailsMember.email || <span className="italic text-xs">No email</span>}</SheetDescription>
                  <div className="flex gap-2 mt-2 flex-wrap justify-center">
                    <Badge className={getStatusColor(detailsMember.membership_status)}>
                      {detailsMember.membership_status || "Unknown"}
                    </Badge>
                    {detailsMember.ministry && (
                      <Badge variant="outline">{detailsMember.ministry.replace(/_/g, " ")}</Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-6 mt-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-base text-muted-foreground">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <span>{detailsMember.phone_number || <span className="italic">No phone</span>}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base text-muted-foreground">
                      <Mail className="h-5 w-5 text-green-500" />
                      <span>{detailsMember.email || <span className="italic">No email</span>}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base text-muted-foreground">
                      <MapPin className="h-5 w-5 text-purple-500" />
                      <span>{detailsMember.address || <span className="italic">No address</span>}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base text-muted-foreground">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <span>Joined: {detailsMember.membership_date ? new Date(detailsMember.membership_date).toLocaleDateString() : <span className="italic">Unknown</span>}</span>
                    </div>
                  </div>
                </div>

                {/* Donation Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Donation History</h3>
                  {(() => {
                    const donationStats = getMemberDonationStats(detailsMember.id);
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="bg-emerald-50 border-emerald-200">
                            <CardContent className="p-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-700">₵{donationStats.totalAmount.toLocaleString()}</div>
                                <div className="text-xs text-emerald-600">Total Donations</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-700">{donationStats.donationCount}</div>
                                <div className="text-xs text-blue-600">Donation Count</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {donationStats.hasDonations ? (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-foreground">Recent Donations</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {donationStats.recentDonations.map((donation, idx) => (
                                <Card key={idx} className="bg-muted/30">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="font-medium text-foreground">₵{Number(donation.amount).toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">{donation.donation_type || 'General'}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(donation.donation_date).toLocaleDateString()}
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {donation.payment_method || 'Unknown'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No donation records found</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Additional Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Department:</span>
                      <div className="text-foreground">{detailsMember.department || <span className="italic">-</span>}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Role:</span>
                      <div className="text-foreground">{detailsMember.role || <span className="italic">-</span>}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Marital Status:</span>
                      <div className="text-foreground">{detailsMember.marital_status || <span className="italic">-</span>}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Gender:</span>
                      <div className="text-foreground">{detailsMember.gender || <span className="italic">-</span>}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Date of Birth:</span>
                      <div className="text-foreground">
                        {detailsMember.date_of_birth ? new Date(detailsMember.date_of_birth).toLocaleDateString() : <span className="italic">-</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Member ID:</span>
                      <div className="text-foreground">{detailsMember.member_id || <span className="italic">-</span>}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Membership Type:</span>
                      <div className="text-foreground">{detailsMember.membership_type || <span className="italic">-</span>}</div>
                    </div>
                  </div>
                  {detailsMember.notes && (
                    <div>
                      <span className="font-medium text-muted-foreground">Notes:</span>
                      <div className="text-foreground mt-1 p-2 bg-muted rounded-md">{detailsMember.notes}</div>
                    </div>
                  )}
                </div>
              </div>
              <SheetClose asChild>
                <Button className="mt-8 w-full" variant="outline">Close</Button>
              </SheetClose>
            </>
          )}
        </SheetContent>
      </Sheet>
      {/* Edit Member Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update the member's information and profile photo as needed.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <label htmlFor="edit-photo-upload" className="cursor-pointer">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={editPhotoPreview || editingMember?.profile_image_url || undefined} />
                      <AvatarFallback>+</AvatarFallback>
                    </Avatar>
                  </label>
                  <input
                    id="edit-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setEditPhotoFile(file);
                      setEditPhotoPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  {editPhotoFile && <span className="text-xs text-muted-foreground">{editPhotoFile.name}</span>}
                </div>
                <div className="flex gap-2">
                  <FormField name="first_name" control={editForm.control} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="last_name" control={editForm.control} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField name="email" control={editForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="phone_number" control={editForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="ministry" control={editForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ministry</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Ministry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men_ministry">Men Ministry</SelectItem>
                          <SelectItem value="youth_ministry">Youth Ministry</SelectItem>
                          <SelectItem value="women_ministry">Women Ministry</SelectItem>
                          <SelectItem value="children_ministry">Children's Ministry</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="membership_status" control={editForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="address" control={editForm.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Member Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingMember?.first_name} {deletingMember?.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}