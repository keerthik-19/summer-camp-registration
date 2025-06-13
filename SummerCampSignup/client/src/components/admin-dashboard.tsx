import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";
import { Search, Download, Mail, Eye, Check, X, Clock, LogOut, Database, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminStats {
  totalRegistrations: number;
  totalRevenue: number;
  pendingReviews: number;
  programStats: { program: string; count: number; capacity: number }[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/admin-login");
    },
    onError: () => {
      toast({
        title: "Logout Error",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ["/api/registrations"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/registrations/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Status Updated",
        description: "Registration status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update registration status.",
        variant: "destructive",
      });
    },
  });

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/registrations/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Registration Deleted",
        description: "Registration has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete registration.",
        variant: "destructive",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/registrations/${id}/send-reminder`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Reminder Sent" : "Send Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Send Error",
        description: "Failed to send payment reminder.",
        variant: "destructive",
      });
    },
  });

  const bulkReminderMutation = useMutation({
    mutationFn: async (registrationIds: number[]) => {
      const response = await apiRequest("POST", "/api/registrations/bulk-reminder", { registrationIds });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Reminders Sent",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Send Error",
        description: "Failed to send bulk payment reminders.",
        variant: "destructive",
      });
    },
  });

  if (statsLoading || registrationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteRegistration = (id: number, childName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the registration for ${childName}? This action cannot be undone.`)) {
      deleteRegistrationMutation.mutate(id);
    }
  };

  const handleSendReminder = (id: number) => {
    sendReminderMutation.mutate(id);
  };

  const handleBulkReminders = () => {
    const pendingRegistrations = filteredRegistrations.filter(reg => reg.paymentStatus === "pending");
    if (pendingRegistrations.length === 0) {
      toast({
        title: "No Pending Payments",
        description: "There are no registrations with pending payments.",
        variant: "default",
      });
      return;
    }
    
    const registrationIds = pendingRegistrations.map(reg => reg.id);
    bulkReminderMutation.mutate(registrationIds);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgramName = (program: string): string => {
    switch (program) {
      case "full-day":
        return "Full Day Program";
      case "half-day":
        return "Half Day Program";
      case "cultural-5-9":
        return "Cultural Heritage (Ages 5-9)";
      case "educational-8-12":
        return "Educational Excellence (Ages 8-12)";
      case "leadership-12-15":
        return "Community Leadership (Ages 12-15)";
      default:
        return program;
    }
  };

  // Filter registrations based on search and status
  const filteredRegistrations = registrations?.filter((registration: Registration) => {
    const matchesSearch = searchTerm === "" || 
      registration.childFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.childLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.parentGuardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.parentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.registrationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || registration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const exportToCSV = () => {
    if (!registrations || registrations.length === 0) return;
    
    const headers = [
      "E-Ticket Number", "Child Name", "Age", "T-Shirt Size", "Parent/Guardian", 
      "Email", "Phone", "Registration Date", "Status", "Payment Status", "Fee",
      "Physician Name", "Physician Phone", "Medical Insurance", "Allergies", 
      "Medications", "Medical Conditions", "Dietary Restrictions"
    ];
    
    const csvData = registrations.map((reg: Registration) => [
      reg.registrationId,
      `${reg.childFirstName} ${reg.childLastName}`,
      reg.age,
      reg.tshirtSize || 'Not specified',
      reg.parentGuardianName,
      reg.parentEmail,
      reg.parentPhone,
      new Date(reg.createdAt).toLocaleDateString(),
      reg.status,
      reg.paymentStatus,
      `$${reg.registrationFee}`,
      reg.physicianName || 'Not provided',
      reg.physicianPhone || 'Not provided',
      reg.medicalInsurance || 'Not provided',
      reg.allergies || 'Not provided',
      reg.medications || 'Not provided',
      reg.medicalConditions || 'None reported',
      reg.dietaryRestrictions || 'None reported'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map((field: any) => `"${field}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `camp_registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Registration data has been exported to CSV.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-temple-darkblue">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {(admin as any)?.username || 'Admin'}</p>
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={exportToCSV}
            className="bg-temple-orange hover:bg-temple-saffron text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button 
            onClick={handleBulkReminders}
            disabled={bulkReminderMutation.isPending}
            className="bg-temple-blue hover:bg-temple-darkblue text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            {bulkReminderMutation.isPending ? "Sending..." : "Send Payment Reminders"}
          </Button>
          <Button 
            onClick={() => setLocation("/database-admin")}
            variant="outline"
            className="text-temple-darkblue border-temple-darkblue hover:bg-temple-cream"
          >
            <Database className="w-4 h-4 mr-2" />
            Database Admin
          </Button>
          <Button 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-temple-darkblue">{stats?.totalRegistrations || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#16a34a]">
                <i className="fas fa-users text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-temple-darkblue">
                  ${stats?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2662d9]">
                <i className="fas fa-dollar-sign text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-temple-darkblue">{stats?.pendingReviews || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#eb0000]">
                <i className="fas fa-clock text-white"></i>
              </div>
            </div>
          </CardContent>
        </Card>
        
        
      </div>
      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or e-ticket number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Registration Management Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-temple-darkblue">
              Registrations ({filteredRegistrations.length})
            </CardTitle>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-yellow-600">
                {filteredRegistrations.filter(r => r.status === 'pending').length} Pending
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {filteredRegistrations.filter(r => r.status === 'confirmed').length} Confirmed
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">T-Shirt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm || statusFilter !== "all" ? "No matching registrations found" : "No registrations found"}
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((registration: Registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {registration.childFirstName} {registration.childLastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {registration.tshirtSize || 'Not specified'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.parentGuardianName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(registration.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={registration.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                          {registration.paymentStatus === "pending" ? "Payment Pending" : "Payment Complete"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {registration.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(registration.id, "confirmed")}
                              disabled={updateStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Approve
                            </Button>
                          )}
                          {registration.paymentStatus === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleSendReminder(registration.id)}
                              disabled={sendReminderMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Remind
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRegistration(registration)}
                                className="text-temple-orange hover:text-temple-saffron border-temple-orange hover:border-temple-saffron"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRegistration(registration.id, `${registration.childFirstName} ${registration.childLastName}`)}
                            disabled={deleteRegistrationMutation.isPending}
                            className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-temple-darkblue">
                                  Registration Details - {registration.registrationId}
                                </DialogTitle>
                              </DialogHeader>
                              
                              <Tabs defaultValue="overview" className="mt-4">
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="overview">Overview</TabsTrigger>
                                  <TabsTrigger value="child">Child Info</TabsTrigger>
                                  <TabsTrigger value="parent">Parent Info</TabsTrigger>
                                  <TabsTrigger value="medical">Medical</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="overview" className="space-y-4">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <Card>
                                      <CardContent className="p-4">
                                        <h4 className="font-semibold mb-2">Registration Status</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span>E-Ticket:</span>
                                            <Badge variant="outline">{registration.registrationId}</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Status:</span>
                                            {getStatusBadge(registration.status)}
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Registered:</span>
                                            <span>{new Date(registration.createdAt).toLocaleDateString()}</span>
                                          </div>
                                          
                                          <div className="flex justify-between">
                                            <span>Fee:</span>
                                            <span className="font-semibold">${registration.registrationFee}</span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    
                                    <Card>
                                      <CardContent className="p-4">
                                        <h4 className="font-semibold mb-2">Quick Actions</h4>
                                        <div className="space-y-2">
                                          {registration.status === "pending" && (
                                            <Button
                                              onClick={() => handleStatusUpdate(registration.id, "confirmed")}
                                              disabled={updateStatusMutation.isPending}
                                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            >
                                              <Check className="w-4 h-4 mr-2" />
                                              Approve Registration
                                            </Button>
                                          )}
                                          <Button
                                            onClick={() => handleStatusUpdate(registration.id, "cancelled")}
                                            disabled={updateStatusMutation.isPending}
                                            variant="outline"
                                            className="w-full text-red-600 border-red-600 hover:bg-red-50"
                                          >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel Registration
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="child" className="space-y-4">
                                  <Card>
                                    <CardContent className="p-4">
                                      <h4 className="font-semibold mb-4">Child Information</h4>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Full Name</label>
                                          <p className="text-lg">{registration.childFirstName} {registration.childLastName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                                          <p>{registration.dateOfBirth}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Age</label>
                                          <p>{registration.age} years old</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Gender</label>
                                          <p className="capitalize">{registration.gender}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Grade Completing</label>
                                          <p>{registration.gradeCompleting}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Previous Attendance</label>
                                          <p>{registration.previousAttendance ? "Yes" : "No"}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>
                                
                                <TabsContent value="parent" className="space-y-4">
                                  <Card>
                                    <CardContent className="p-4">
                                      <h4 className="font-semibold mb-4">Parent/Guardian Information</h4>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Name</label>
                                          <p className="text-lg">{registration.parentGuardianName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Relationship</label>
                                          <p className="capitalize">{registration.relationship}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Email</label>
                                          <p>{registration.parentEmail}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Phone</label>
                                          <p>{registration.parentPhone}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-sm font-medium text-gray-600">Address</label>
                                          <p>{registration.homeAddress}, {registration.city}, {registration.state} {registration.zipCode}</p>
                                        </div>
                                      </div>
                                      
                                      <h5 className="font-semibold mt-6 mb-4">Emergency Contact</h5>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Name</label>
                                          <p>{registration.emergencyContactName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Phone</label>
                                          <p>{registration.emergencyContactPhone}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Relationship</label>
                                          <p className="capitalize">{registration.emergencyContactRelation}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Pickup Authorization</label>
                                          <p>{registration.pickupAuthorization}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>
                                
                                <TabsContent value="medical" className="space-y-4">
                                  <Card>
                                    <CardContent className="p-4">
                                      <h4 className="font-semibold mb-4">Medical Information</h4>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Physician Name</label>
                                          <p>{registration.physicianName || "Not provided"}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Physician Phone</label>
                                          <p>{registration.physicianPhone || "Not provided"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-sm font-medium text-gray-600">Medical Insurance</label>
                                          <p>{registration.medicalInsurance || "Not provided"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-sm font-medium text-gray-600">Allergies</label>
                                          <p>{registration.allergies || "None reported"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-sm font-medium text-gray-600">Current Medications</label>
                                          <p>{registration.medications || "None reported"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-sm font-medium text-gray-600">Medical Conditions</label>
                                          <p>{registration.medicalConditions || "None reported"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-sm font-medium text-gray-600">Dietary Restrictions</label>
                                          <p>{registration.dietaryRestrictions || "None reported"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="text-sm font-medium text-gray-600">Special Accommodations</label>
                                          <p>{registration.specialAccommodations || "None requested"}</p>
                                        </div>
                                      </div>
                                      
                                      <h5 className="font-semibold mt-6 mb-4">Consent & Waivers</h5>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                          {registration.medicalTreatmentConsent ? 
                                            <Check className="w-5 h-5 text-green-600" /> : 
                                            <X className="w-5 h-5 text-red-600" />
                                          }
                                          <span>Medical Treatment Consent</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {registration.liabilityWaiver ? 
                                            <Check className="w-5 h-5 text-green-600" /> : 
                                            <X className="w-5 h-5 text-red-600" />
                                          }
                                          <span>Liability Waiver</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {registration.photoVideoConsent ? 
                                            <Check className="w-5 h-5 text-green-600" /> : 
                                            <X className="w-5 h-5 text-red-600" />
                                          }
                                          <span>Photo/Video Consent</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {registration.termsAccepted ? 
                                            <Check className="w-5 h-5 text-green-600" /> : 
                                            <X className="w-5 h-5 text-red-600" />
                                          }
                                          <span>Terms & Conditions</span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
