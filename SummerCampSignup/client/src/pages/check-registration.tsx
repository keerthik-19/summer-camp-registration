import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

export default function CheckRegistration() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [lastName, setLastName] = useState("");
  const [registration, setRegistration] = useState<Registration | null>(null);
  const { toast } = useToast();

  const lookupMutation = useMutation({
    mutationFn: async (data: { ticketNumber: string; lastName: string }) => {
      const response = await apiRequest("POST", "/api/registrations/lookup", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (data: Registration) => {
      setRegistration(data);
      toast({
        title: "Registration Found",
        description: "Your registration details are displayed below.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Not Found",
        description: error.message,
        variant: "destructive",
      });
      setRegistration(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim() || !lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both ticket number and last name.",
        variant: "destructive",
      });
      return;
    }
    lookupMutation.mutate({ ticketNumber: ticketNumber.trim(), lastName: lastName.trim() });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgramName = (program: string) => {
    const programNames = {
      "cultural-5-9": "Cultural Heritage & Values (Ages 5-9)",
      "educational-8-12": "Educational Excellence (Ages 8-12)",
      "leadership-12-15": "Leadership Development (Ages 12-15)",
    };
    return programNames[program as keyof typeof programNames] || program;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Check Registration Status</h1>
        <p className="text-gray-600">
          Enter your e-ticket number and child's last name to view registration details
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Registration Lookup</CardTitle>
          <CardDescription>
            Find your registration using the e-ticket number from your confirmation email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticketNumber">E-Ticket Number</Label>
                <Input
                  id="ticketNumber"
                  placeholder="BOF2025-123456789"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Child's Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={lookupMutation.isPending} className="w-full">
              {lookupMutation.isPending ? "Searching..." : "Find Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {registration && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registration Details</CardTitle>
              <Badge className={getStatusColor(registration.status)}>
                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-amber-900">Child Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {registration.childFirstName} {registration.childLastName}</p>
                  <p><span className="font-medium">Age:</span> {registration.age} years old</p>
                  <p><span className="font-medium">Grade Completing:</span> {registration.gradeCompleting}</p>
                  <p><span className="font-medium">Date of Birth:</span> {registration.dateOfBirth}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-amber-900">Program Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Program:</span> {getProgramName(registration.program)}</p>
                  <p><span className="font-medium">Session Dates:</span> {registration.sessionDates}</p>
                  <p><span className="font-medium">Registration Fee:</span> ${registration.registrationFee}</p>
                  <p><span className="font-medium">Payment Status:</span> 
                    <Badge className={registration.paymentStatus === "completed" ? "bg-green-100 text-green-800 ml-2" : "bg-yellow-100 text-yellow-800 ml-2"}>
                      {registration.paymentStatus}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-3 text-amber-900">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><span className="font-medium">Parent/Guardian:</span> {registration.parentGuardianName}</p>
                  <p><span className="font-medium">Relationship:</span> {registration.relationship}</p>
                  <p><span className="font-medium">Email:</span> {registration.parentEmail}</p>
                  <p><span className="font-medium">Phone:</span> {registration.parentPhone}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-medium">Emergency Contact:</span> {registration.emergencyContactName}</p>
                  <p><span className="font-medium">Emergency Phone:</span> {registration.emergencyContactPhone}</p>
                  <p><span className="font-medium">Emergency Relation:</span> {registration.emergencyContactRelation}</p>
                </div>
              </div>
            </div>

            {(registration.allergies || registration.medications || registration.medicalConditions || registration.dietaryRestrictions) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-amber-900">Medical Information</h3>
                  <div className="space-y-2">
                    {registration.allergies && <p><span className="font-medium">Allergies:</span> {registration.allergies}</p>}
                    {registration.medications && <p><span className="font-medium">Medications:</span> {registration.medications}</p>}
                    {registration.medicalConditions && <p><span className="font-medium">Medical Conditions:</span> {registration.medicalConditions}</p>}
                    {registration.dietaryRestrictions && <p><span className="font-medium">Dietary Restrictions:</span> {registration.dietaryRestrictions}</p>}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-amber-900">E-Ticket Information</h3>
              <p className="text-sm text-gray-600 mb-2">
                Your e-ticket number: <span className="font-mono font-bold text-amber-800">{registration.registrationId}</span>
              </p>
              <p className="text-sm text-gray-600">
                Registration Date: {new Date(registration.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}