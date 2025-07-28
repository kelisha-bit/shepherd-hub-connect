import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, Phone, Mail, MapPin, Edit, Trash2, UserPlus, Filter, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Visitor {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  visit_date: string;
  visited_before: boolean;
  how_did_you_hear_about_us?: string;
  notes?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

interface VisitorFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  visit_date: Date;
  visited_before: boolean;
  how_did_you_hear_about_us: string;
  notes: string;
  follow_up_required: boolean;
  follow_up_date?: Date;
}

const initialFormData: VisitorFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  address: "",
  city: "",
  state: "",
  country: "",
  visit_date: new Date(),
  visited_before: false,
  how_did_you_hear_about_us: "",
  notes: "",
  follow_up_required: true,
  follow_up_date: undefined,
};

export function VisitorsList() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [formData, setFormData] = useState<VisitorFormData>(initialFormData);
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Reset form when add modal closes
  useEffect(() => {
    if (!isAddModalOpen) {
      setFormData(initialFormData);
    }
  }, [isAddModalOpen]);

  // Reset form when edit modal closes
  useEffect(() => {
    if (!isEditModalOpen) {
      setFormData(initialFormData);
      setSelectedVisitor(null);
    }
  }, [isEditModalOpen]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .order("visit_date", { ascending: false });

      if (error) throw error;
      setVisitors(data || []);
    } catch (error) {
      console.error("Error fetching visitors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch visitors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisitor = async () => {
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const visitorData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone_number: formData.phone_number.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        country: formData.country.trim() || null,
        visit_date: format(formData.visit_date, "yyyy-MM-dd"),
        visited_before: formData.visited_before,
        how_did_you_hear_about_us: formData.how_did_you_hear_about_us || null,
        notes: formData.notes.trim() || null,
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_date ? format(formData.follow_up_date, "yyyy-MM-dd") : null,
      };

      const { data, error } = await supabase
        .from("visitors")
        .insert([visitorData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Visitor added successfully",
      });

      setFormData(initialFormData);
      setIsAddModalOpen(false);
      fetchVisitors();
    } catch (error) {
      console.error("Error adding visitor:", error);
      toast({
        title: "Error",
        description: "Failed to add visitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVisitor = async () => {
    if (!selectedVisitor) return;

    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const visitorData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone_number: formData.phone_number.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        country: formData.country.trim() || null,
        visit_date: format(formData.visit_date, "yyyy-MM-dd"),
        visited_before: formData.visited_before,
        how_did_you_hear_about_us: formData.how_did_you_hear_about_us || null,
        notes: formData.notes.trim() || null,
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_date ? format(formData.follow_up_date, "yyyy-MM-dd") : null,
      };

      const { error } = await supabase
        .from("visitors")
        .update(visitorData)
        .eq("id", selectedVisitor.id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Visitor updated successfully",
      });

      setFormData(initialFormData);
      setIsEditModalOpen(false);
      setSelectedVisitor(null);
      fetchVisitors();
    } catch (error) {
      console.error("Error updating visitor:", error);
      toast({
        title: "Error",
        description: "Failed to update visitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVisitor = async (visitorId: string) => {
    if (!confirm("Are you sure you want to delete this visitor?")) return;

    try {
      const { error } = await supabase
        .from("visitors")
        .delete()
        .eq("id", visitorId);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Visitor deleted successfully",
      });

      fetchVisitors();
    } catch (error) {
      console.error("Error deleting visitor:", error);
      toast({
        title: "Error",
        description: "Failed to delete visitor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setFormData({
      first_name: visitor.first_name,
      last_name: visitor.last_name,
      email: visitor.email || "",
      phone_number: visitor.phone_number || "",
      address: visitor.address || "",
      city: visitor.city || "",
      state: visitor.state || "",
      country: visitor.country || "",
      visit_date: new Date(visitor.visit_date),
      visited_before: visitor.visited_before,
      how_did_you_hear_about_us: visitor.how_did_you_hear_about_us || "",
      notes: visitor.notes || "",
      follow_up_required: visitor.follow_up_required,
      follow_up_date: visitor.follow_up_date ? new Date(visitor.follow_up_date) : undefined,
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsViewModalOpen(true);
  };



  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch = `${visitor.first_name} ${visitor.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      visitor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.phone_number?.includes(searchTerm);

    const matchesFilter = filterStatus === "all" ||
      (filterStatus === "returning" && visitor.visited_before) ||
      (filterStatus === "new" && !visitor.visited_before) ||
      (filterStatus === "follow-up" && visitor.follow_up_required);

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (visitor: Visitor) => {
    if (visitor.follow_up_required) {
      return <Badge variant="destructive" className="text-xs">Follow-up Required</Badge>;
    }
    if (visitor.visited_before) {
      return <Badge variant="secondary" className="text-xs">Returning</Badge>;
    }
    return <Badge variant="outline" className="text-xs">New</Badge>;
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Visitors</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Visitors</h1>
          <p className="text-muted-foreground">Manage church visitors and follow-ups</p>
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Visitor
        </Button>
      </div>

      {/* New Add Visitor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Visitor</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddVisitor();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone_number"
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-2">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="visit_date" className="block text-sm font-medium mb-2">
                    Visit Date *
                  </label>
                  <input
                    id="visit_date"
                    type="date"
                    value={formData.visit_date ? format(formData.visit_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      setFormData(prev => ({ ...prev, visit_date: date }));
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="follow_up_date" className="block text-sm font-medium mb-2">
                    Follow-up Date
                  </label>
                  <input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date ? format(formData.follow_up_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      setFormData(prev => ({ ...prev, follow_up_date: date }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="how_did_you_hear" className="block text-sm font-medium mb-2">
                    How did you hear about us?
                  </label>
                  <select
                    id="how_did_you_hear"
                    value={formData.how_did_you_hear_about_us}
                    onChange={(e) => setFormData(prev => ({ ...prev, how_did_you_hear_about_us: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an option</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend_family">Friend/Family</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="website">Website</option>
                    <option value="walk_in">Walk-in</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any additional notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visited_before}
                    onChange={(e) => setFormData(prev => ({ ...prev, visited_before: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Has visited before</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, follow_up_required: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Follow-up required</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.first_name.trim() || !formData.last_name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Visitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search visitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visitors</SelectItem>
            <SelectItem value="new">New Visitors</SelectItem>
            <SelectItem value="returning">Returning Visitors</SelectItem>
            <SelectItem value="follow-up">Follow-up Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{visitors.length}</div>
            <div className="text-sm text-muted-foreground">Total Visitors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{visitors.filter(v => !v.visited_before).length}</div>
            <div className="text-sm text-muted-foreground">New Visitors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{visitors.filter(v => v.visited_before).length}</div>
            <div className="text-sm text-muted-foreground">Returning Visitors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{visitors.filter(v => v.follow_up_required).length}</div>
            <div className="text-sm text-muted-foreground">Follow-up Required</div>
          </CardContent>
        </Card>
      </div>

      {/* Visitors Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVisitors.map((visitor) => (
          <Card key={visitor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {visitor.first_name} {visitor.last_name}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(visitor)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openViewModal(visitor)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(visitor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVisitor(visitor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Visited: {format(new Date(visitor.visit_date), "MMM dd, yyyy")}
              </div>
              
              {visitor.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{visitor.email}</span>
                </div>
              )}
              
              {visitor.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{visitor.phone_number}</span>
                </div>
              )}
              
              {(visitor.city || visitor.state) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">
                    {[visitor.city, visitor.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              
              {visitor.notes && (
                <div className="text-sm bg-muted p-2 rounded text-muted-foreground">
                  {visitor.notes.length > 100 
                    ? `${visitor.notes.substring(0, 100)}...` 
                    : visitor.notes
                  }
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVisitors.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No visitors found</p>
          {searchTerm || filterStatus !== "all" ? (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filter criteria
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Get started by adding your first visitor
            </p>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Visitor</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedVisitor(null);
                  setFormData(initialFormData);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateVisitor();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="edit_first_name" className="block text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    id="edit_first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_last_name" className="block text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    id="edit_last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="edit_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_phone_number" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    id="edit_phone_number"
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_address" className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <input
                    id="edit_address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_city" className="block text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    id="edit_city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_state" className="block text-sm font-medium mb-2">
                    State
                  </label>
                  <input
                    id="edit_state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_country" className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    id="edit_country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_visit_date" className="block text-sm font-medium mb-2">
                    Visit Date *
                  </label>
                  <input
                    id="edit_visit_date"
                    type="date"
                    value={formData.visit_date ? format(formData.visit_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      setFormData(prev => ({ ...prev, visit_date: date }));
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_follow_up_date" className="block text-sm font-medium mb-2">
                    Follow-up Date
                  </label>
                  <input
                    id="edit_follow_up_date"
                    type="date"
                    value={formData.follow_up_date ? format(formData.follow_up_date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      setFormData(prev => ({ ...prev, follow_up_date: date }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_how_did_you_hear" className="block text-sm font-medium mb-2">
                    How did you hear about us?
                  </label>
                  <select
                    id="edit_how_did_you_hear"
                    value={formData.how_did_you_hear_about_us}
                    onChange={(e) => setFormData(prev => ({ ...prev, how_did_you_hear_about_us: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an option</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend_family">Friend/Family</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="website">Website</option>
                    <option value="walk_in">Walk-in</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit_notes" className="block text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    id="edit_notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any additional notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visited_before}
                    onChange={(e) => setFormData(prev => ({ ...prev, visited_before: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Has visited before</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, follow_up_required: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Follow-up required</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedVisitor(null);
                    setFormData(initialFormData);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.first_name.trim() || !formData.last_name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Visitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedVisitor.first_name} {selectedVisitor.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Visit Date</Label>
                  <p className="text-sm">{format(new Date(selectedVisitor.visit_date), "PPP")}</p>
                </div>
                {selectedVisitor.email && (
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedVisitor.email}</p>
                  </div>
                )}
                {selectedVisitor.phone_number && (
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedVisitor.phone_number}</p>
                  </div>
                )}
                {selectedVisitor.address && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm">{selectedVisitor.address}</p>
                  </div>
                )}
                {(selectedVisitor.city || selectedVisitor.state || selectedVisitor.country) && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm">
                      {[selectedVisitor.city, selectedVisitor.state, selectedVisitor.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
                {selectedVisitor.how_did_you_hear_about_us && (
                  <div>
                    <Label className="text-sm font-medium">How did you hear about us?</Label>
                    <p className="text-sm capitalize">{selectedVisitor.how_did_you_hear_about_us.replace("_", " ")}</p>
                  </div>
                )}
                {selectedVisitor.follow_up_date && (
                  <div>
                    <Label className="text-sm font-medium">Follow-up Date</Label>
                    <p className="text-sm">{format(new Date(selectedVisitor.follow_up_date), "PPP")}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {getStatusBadge(selectedVisitor)}
                {selectedVisitor.visited_before && (
                  <Badge variant="secondary">Returning Visitor</Badge>
                )}
              </div>
              
              {selectedVisitor.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded">{selectedVisitor.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}