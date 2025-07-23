import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Users, Bookmark } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for resources
const resources = [
  { id: 1, name: "Main Sanctuary", type: "facility", capacity: 500, image: "/placeholder.svg" },
  { id: 2, name: "Fellowship Hall", type: "facility", capacity: 200, image: "/placeholder.svg" },
  { id: 3, name: "Conference Room", type: "facility", capacity: 30, image: "/placeholder.svg" },
  { id: 4, name: "Sound System", type: "equipment", image: "/placeholder.svg" },
  { id: 5, name: "Projector", type: "equipment", image: "/placeholder.svg" },
  { id: 6, name: "Chairs (50)", type: "equipment", image: "/placeholder.svg" },
];

export default function ResourceBookingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("facilities");
  const [bookings, setBookings] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: new Date(),
    startTime: "",
    endTime: "",
    purpose: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Mock data for bookings
    setBookings([
      { id: 1, resourceId: 1, resourceName: "Main Sanctuary", date: "2024-08-01", startTime: "09:00", endTime: "12:00", status: "approved" },
      { id: 2, resourceId: 4, resourceName: "Sound System", date: "2024-08-03", startTime: "14:00", endTime: "17:00", status: "pending" },
    ]);
  }, []);

  const filteredResources = resources.filter(resource => {
    if (activeTab === "facilities") return resource.type === "facility";
    if (activeTab === "equipment") return resource.type === "equipment";
    return true;
  });

  const handleBookResource = (resource) => {
    setSelectedResource(resource);
    setShowForm(true);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newBooking = {
        id: Date.now(),
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        date: format(bookingForm.date, "yyyy-MM-dd"),
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        purpose: bookingForm.purpose,
        status: "pending",
      };
      
      setBookings([...bookings, newBooking]);
      setSubmitting(false);
      setShowForm(false);
      setBookingForm({
        date: new Date(),
        startTime: "",
        endTime: "",
        purpose: "",
      });
    }, 1000);
  };

  return (
    <div className="py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Resource Booking</h1>
      
      <Tabs defaultValue="facilities" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="facilities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <Card key={resource.id} className="overflow-hidden">
                <img src={resource.image} alt={resource.name} className="w-full h-40 object-cover" />
                <CardHeader>
                  <CardTitle>{resource.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resource.capacity && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Capacity: {resource.capacity}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleBookResource(resource)} className="w-full">
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <Card key={resource.id} className="overflow-hidden">
                <img src={resource.image} alt={resource.name} className="w-full h-40 object-cover" />
                <CardHeader>
                  <CardTitle>{resource.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Equipment-specific details could go here */}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleBookResource(resource)} className="w-full">
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="my-bookings" className="space-y-6">
          {bookings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">You have no bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{booking.resourceName}</CardTitle>
                      <Badge variant={booking.status === "approved" ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    {booking.purpose && (
                      <div className="text-sm mt-2">
                        <p className="font-medium">Purpose:</p>
                        <p>{booking.purpose}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" disabled={booking.status === "approved"}>
                      {booking.status === "approved" ? "Approved" : "Cancel Booking"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {showForm && selectedResource && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Book {selectedResource.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingForm.date ? format(bookingForm.date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingForm.date}
                      onSelect={(date) => setBookingForm({...bookingForm, date})}                      
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium">Start Time</label>
                  <Select 
                    value={bookingForm.startTime} 
                    onValueChange={(value) => setBookingForm({...bookingForm, startTime: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 14}, (_, i) => i + 7).map(hour => (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">End Time</label>
                  <Select 
                    value={bookingForm.endTime} 
                    onValueChange={(value) => setBookingForm({...bookingForm, endTime: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 14}, (_, i) => i + 8).map(hour => (
                        <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Purpose</label>
                <Input 
                  value={bookingForm.purpose} 
                  onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})} 
                  placeholder="Describe the purpose of your booking" 
                  required 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Confirm Booking"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}