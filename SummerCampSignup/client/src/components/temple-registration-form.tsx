import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertRegistrationSchema } from "@shared/schema";

const formSchema = insertRegistrationSchema.extend({
  confirmEmail: z.string().email("Please enter a valid email address"),
  allergies: z.string().min(1, "Please list allergies or write 'None'"),
  medications: z.string().min(1, "Please list medications or write 'None'"),
}).refine((data) => data.parentEmail === data.confirmEmail, {
  message: "Email addresses don't match",
  path: ["confirmEmail"],
});

type FormData = z.infer<typeof formSchema>;

const DRAFT_STORAGE_KEY = "camp_registration_draft";

export default function TempleRegistrationForm() {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [completedRegistration, setCompletedRegistration] = useState<any>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childFirstName: "",
      childLastName: "",
      dateOfBirth: "",
      age: 5,
      gender: "",
      gradeCompleting: "",
      parentGuardianName: "",
      relationship: "Parent",
      parentEmail: "",
      confirmEmail: "",
      parentPhone: "",
      homeAddress: "",
      city: "",
      state: "",
      zipCode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      physicianName: "",
      physicianPhone: "",
      medicalInsurance: "",
      allergies: "",
      medications: "",
      medicalConditions: "",
      dietaryRestrictions: "",
      tshirtSize: "",
      program: "",
      sessionDates: "",
      specialAccommodations: "",
      previousAttendance: false,
      howDidYouHear: "",
      pickupAuthorization: "",
      photoVideoConsent: false,
      medicalTreatmentConsent: false,
      liabilityWaiver: false,
      paymentMethod: "online",
      registrationFee: "450",
      termsAccepted: false,
    },
  });

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setHasDraft(true);
        setLastSaved(new Date(draftData.savedAt));
      } catch (error) {
        console.error("Error loading draft:", error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  }, []);

  // Auto-save draft every 30 seconds when form has values
  useEffect(() => {
    const formValues = form.getValues();
    const hasContent = Object.values(formValues).some(value => 
      value !== "" && value !== null && value !== undefined && value !== false
    );

    if (hasContent && !registrationComplete) {
      const interval = setInterval(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [form.watch()]);

  const saveDraft = () => {
    const formData = form.getValues();
    const draftData = {
      ...formData,
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    setLastSaved(new Date());
    setHasDraft(true);
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        const { savedAt, ...formData } = draftData;
        
        // Reset form with draft data
        form.reset(formData);
        setLastSaved(new Date(savedAt));
        
        toast({
          title: "Draft Loaded",
          description: "Your previously saved form data has been restored.",
        });
      } catch (error) {
        console.error("Error loading draft:", error);
        toast({
          title: "Error Loading Draft",
          description: "There was an error loading your saved draft.",
          variant: "destructive",
        });
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setLastSaved(null);
    form.reset();
    toast({
      title: "Draft Cleared",
      description: "Your saved draft has been removed.",
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { confirmEmail, ...registrationData } = data;
      
      // Ensure registrationFee is a string and add program field for backend compatibility
      const processedData = {
        ...registrationData,
        registrationFee: String(registrationData.registrationFee || "450"),
        program: "summer-camp" // Default program since we removed selection
      };
      
      const response = await apiRequest("POST", "/api/registrations", processedData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: (registration) => {
      console.log("Registration successful:", registration);
      setCompletedRegistration(registration);
      setRegistrationComplete(true);
      // Clear draft after successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraft(false);
      setLastSaved(null);
      toast({
        title: "Registration Submitted Successfully!",
        description: `Your e-ticket number is ${registration.registrationId}`,
      });
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error processing your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (registrationComplete && completedRegistration) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-green-600 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-temple-darkblue mb-4">Registration Submitted!</h2>
            <p className="text-lg text-gray-600 mb-6">Thank you for registering for Build Our Future Summer Camp 2025</p>
            
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-temple-darkblue mb-4">Your E-Ticket Details</h3>
              <div className="text-left space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-lg"><strong>E-Ticket Number:</strong> <span className="text-blue-600 font-mono">{completedRegistration.registrationId}</span></p>
                  <p><strong>Last Name:</strong> {completedRegistration.childLastName}</p>
                  <p className="text-sm text-gray-600 mt-2">Keep this e-ticket number and last name safe - you'll need them to check your registration status.</p>
                </div>
                <p><strong>Child:</strong> {completedRegistration.childFirstName} {completedRegistration.childLastName}</p>
                <p><strong>Program:</strong> {completedRegistration.program}</p>
                <p><strong>Fee:</strong> ${completedRegistration.registrationFee}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              A confirmation email has been sent to your registered email address with payment instructions and additional details.
            </p>
            
            <Button 
              onClick={() => window.print()} 
              className="bg-temple-orange hover:bg-temple-saffron text-white"
            >
              Print Confirmation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-temple-orange to-temple-saffron p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-[#0d0c0c]">Summer Camp Registration Form</h1>
              <p className="text-[#0d0d0d]">Build Our Future - Gokuldham Temple Summer Camp 2025</p>
            </div>
            
            {/* Draft Management Controls */}
            <div className="flex flex-col items-end space-y-2">
              {hasDraft && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Draft Available
                  </Badge>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={loadDraft}
                    className="bg-white text-temple-darkblue border-white hover:bg-gray-100"
                  >
                    Load Draft
                  </Button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={saveDraft}
                  className="bg-white text-temple-darkblue border-white hover:bg-gray-100"
                >
                  Save Progress
                </Button>
                
                {hasDraft && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={clearDraft}
                    className="bg-white text-red-600 border-white hover:bg-gray-100"
                  >
                    Clear Draft
                  </Button>
                )}
              </div>
              
              {lastSaved && (
                <p className="text-xs text-[#0d0d0d]">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
            
            {/* Child Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-temple-darkblue">Child Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="childFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child's First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter child's first name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child's Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter child's last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="5" 
                            max="15" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gradeCompleting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade  *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pre-k">Pre-K</SelectItem>
                          <SelectItem value="kindergarten">Kindergarten</SelectItem>
                          <SelectItem value="1st">1st Grade</SelectItem>
                          <SelectItem value="2nd">2nd Grade</SelectItem>
                          <SelectItem value="3rd">3rd Grade</SelectItem>
                          <SelectItem value="4th">4th Grade</SelectItem>
                          <SelectItem value="5th">5th Grade</SelectItem>
                          <SelectItem value="6th">6th Grade</SelectItem>
                          <SelectItem value="7th">7th Grade</SelectItem>
                          <SelectItem value="8th">8th Grade</SelectItem>
                          <SelectItem value="9th">9th Grade</SelectItem>
                          <SelectItem value="10th">10th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tshirtSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>T-Shirt Size *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select t-shirt size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="youth-xs">Youth XS</SelectItem>
                          <SelectItem value="youth-s">Youth Small</SelectItem>
                          <SelectItem value="youth-m">Youth Medium</SelectItem>
                          <SelectItem value="youth-l">Youth Large</SelectItem>
                          <SelectItem value="youth-xl">Youth XL</SelectItem>
                          <SelectItem value="adult-xs">Adult XS</SelectItem>
                          <SelectItem value="adult-s">Adult Small</SelectItem>
                          <SelectItem value="adult-m">Adult Medium</SelectItem>
                          <SelectItem value="adult-l">Adult Large</SelectItem>
                          <SelectItem value="adult-xl">Adult XL</SelectItem>
                          <SelectItem value="adult-xxl">Adult XXL</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Parent/Guardian Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-temple-darkblue">Parent/Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentGuardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent/Guardian Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter full name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Child *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                            <SelectItem value="Grandparent">Grandparent</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="parent@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Email Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Confirm email address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="(555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="homeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Address *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Street address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="State" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ZIP Code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-temple-darkblue">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Emergency contact full name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone *</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="(555) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="emergencyContactRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Child *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Aunt, Uncle, Grandparent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>



            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-temple-darkblue">Medical Information</CardTitle>
                <p className="text-sm text-gray-600">Required for child safety and emergency preparedness</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="physicianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="Doctor's full name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="physicianPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="(555) 123-4567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="medicalInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Insurance Provider</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Insurance company name and policy number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="List all allergies (food, environmental, medications, etc.) - Write 'None' if no allergies" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="List all current medications, dosages, and instructions - Write 'None' if no medications" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Any medical conditions, disabilities, or special health needs we should be aware of" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Any dietary restrictions, food allergies, or special meal requirements" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-temple-darkblue">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="specialAccommodations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Accommodations Needed</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Any special accommodations or support your child may need" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                

                <FormField
                  control={form.control}
                  name="pickupAuthorization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authorized Pickup Persons *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={2} 
                          placeholder="List names of people authorized to pick up your child (other than parent/guardian)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h4 className="font-bold text-lg text-temple-darkblue mb-4">Terms & Conditions</h4>
                    <div className="text-sm space-y-3 max-h-64 overflow-y-auto">
                      <ul className="space-y-2 text-gray-700">
                        <li>• You must complete and submit the registration form and pay the full camp fee by the specified deadline. No refunds will be issued for cancellations, no-shows or withdrawals after the registration.</li>
                        <li>• Each camper / counselor is required to wear Gokuldham issued badge and T-shirt for the entire duration of the camp, including check in and check out and responsible for preserving the same. Any lost, damaged, misplaced or forgotten badge or T-shirts must be purchased separately to continue attending the camp. Strictly, no exceptions.</li>
                        <li>• You will provide us with accurate and complete information about your child's health, allergies, dietary needs and emergency contacts.</li>
                        <li>• You will ensure that your child follows the camp rules and respects the staff, facilities and other campers. Any violation of these may result in dismissal from the camp without refund. We reserve the right to dismiss any camper who violates the camp rules or causes harm to others or themselves.</li>
                        <li>• You consent to have your photo and video taken during the camp for promotional purposes. You also grant permission to use your name, voice and likeness in any media related to the camp.</li>
                        <li>• You must provide us with accurate and complete information about your child's health, allergies, dietary restrictions, medications, emergency contacts and any special needs. You must also inform us of any changes to this information during the camp session.</li>
                        <li>• You will assume full responsibility for any damage or loss caused by your child to the camp property or equipment.</li>
                        <li>• You must ensure that your child arrives and departs from the camp site on time and with the appropriate clothing, equipment and supplies. We are not responsible for any lost or damaged items.</li>
                        <li>• You must follow our rules and policies regarding safety, discipline, hygiene, communication and participation. We reserve the right to dismiss any camper who violates these rules or disrupts the camp environment without refund or compensation.</li>
                        <li>• You must sign a waiver of liability and indemnity agreement that releases us from any claims or damages arising from your child's participation in the camp activities. You also agree to cover any costs or expenses incurred by us in case of an emergency involving your child.</li>
                        <li>• We would require proof of child's Date Of Birth. We require inspecting of government issued identification for each guardian for the safety of your child.</li>
                        <li>• All day campers, junior counselors and senior counselors are required to check out daily by 7:30 pm ET.</li>
                      </ul>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-semibold">
                            I have read, understood, and agree to all the terms and conditions listed above for Gokuldham Temple Summer Camp *
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="bg-temple-orange hover:bg-temple-saffron text-white font-bold py-4 px-12 text-lg"
              >
                {mutation.isPending ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}