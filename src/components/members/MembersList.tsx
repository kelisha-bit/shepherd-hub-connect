import { useState } from "react";
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
  Users
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
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { v4 as uuidv4 } from 'uuid';
import { Link } from "react-router-dom";

export function MembersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ministryFilter, setMinistryFilter] = useState("all");
  const [members, setMembers] = useState<any[]>([]);
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
    if (editingMember) {
      editForm.reset(editingMember);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMember]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*");
    if (!error) setMembers(data || []);
    setLoading(false);
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

  return (
    <div className="space-y-6">
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
          <div className="flex flex-col md:flex-row gap-4">
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
      <div className="bg-muted/40 rounded-xl p-4">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Loading members...</div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member) => (
              <Link key={member.id} to={`/members/${member.id}`} className="block group">
                <Card className="shadow-md hover:shadow-xl transition-shadow border border-border/70 bg-background/90 cursor-pointer">
                  <CardHeader className="pb-2 flex flex-col items-center relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute right-2 top-2">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setEditingMember(member); setEditOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingMember(member); setDeleteOpen(true); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Avatar className="h-16 w-16 mb-2 shadow-md">
                      <AvatarImage src={member.profile_image_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                        {`${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg font-semibold text-center text-foreground">
                      {member.first_name} {member.last_name}
                    </CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                      {member.email || <span className="italic text-xs">No email</span>}
                    </CardDescription>
                    <div className="flex gap-2 mt-2 flex-wrap justify-center">
                      <Badge className={getStatusColor(member.membership_status)}>
                        {member.membership_status || "Unknown"}
                      </Badge>
                      {member.ministry && (
                        <Badge variant="outline">{member.ministry.replace(/_/g, " ")}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone_number || <span className="italic">No phone</span>}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{member.address || <span className="italic">No address</span>}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined: {member.membership_date ? new Date(member.membership_date).toLocaleDateString() : <span className="italic">Unknown</span>}</span>
                    </div>
                  </CardContent>
                  {/* Actions can be added here as a CardFooter if needed */}
                </Card>
              </Link>
            ))}
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
        <SheetContent side="right" className="max-w-md w-full">
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
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <Phone className="h-5 w-5" />
                  <span>{detailsMember.phone_number || <span className="italic">No phone</span>}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{detailsMember.address || <span className="italic">No address</span>}</span>
                </div>
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Joined: {detailsMember.membership_date ? new Date(detailsMember.membership_date).toLocaleDateString() : <span className="italic">Unknown</span>}</span>
                </div>
                {/* Add more fields as needed */}
                <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-4">
                  <span><b>Department:</b> {detailsMember.department || <span className="italic">-</span>}</span>
                  <span><b>Role:</b> {detailsMember.role || <span className="italic">-</span>}</span>
                  <span><b>Marital Status:</b> {detailsMember.marital_status || <span className="italic">-</span>}</span>
                  <span><b>Gender:</b> {detailsMember.gender || <span className="italic">-</span>}</span>
                  <span><b>Date of Birth:</b> {detailsMember.date_of_birth ? new Date(detailsMember.date_of_birth).toLocaleDateString() : <span className="italic">-</span>}</span>
                  <span><b>Member ID:</b> {detailsMember.member_id || <span className="italic">-</span>}</span>
                  <span><b>Membership Type:</b> {detailsMember.membership_type || <span className="italic">-</span>}</span>
                  <span><b>Notes:</b> {detailsMember.notes || <span className="italic">-</span>}</span>
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