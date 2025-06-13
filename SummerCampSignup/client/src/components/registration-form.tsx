import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertRegistrationSchema } from "@shared/schema";

const formSchema = insertRegistrationSchema.extend({
  dietaryRestrictions: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [completedRegistration, setCompletedRegistration] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childFirstName: "",
      childLastName: "",
      dateOfBirth: "",
      gender: "",
      program: "",
      gradeLevel: "",
      specialInterests: "",
      parentFirstName: "",
      parentLastName: "",
      parentPhone: "",
      parentEmail: "",
      homeAddress: "",
      city: "",
      state: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      allergies: "",
      medicalConditions: "",
      medications: "",
      dietaryRestrictions: [],
      otherDietaryNotes: "",
      physicianName: "",
      physicianPhone: "",
      medicalAuthorization: false,
      paymentMethod: "credit-card",
      termsAccepted: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/registrations", data);
      return response.json();
    },
    onSuccess: (registration) => {
      setCompletedRegistration(registration);
      setRegistrationComplete(true);
      toast({
        title: "Registration Complete!",
        description: "Your child has been successfully registered for summer camp.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const validateCurrentStep = () => {
    const currentValues = form.getValues();
    
    switch (currentStep) {
      case 1:
        return currentValues.childFirstName && currentValues.childLastName && 
               currentValues.dateOfBirth && currentValues.gender && currentValues.program;
      case 2:
        return currentValues.parentFirstName && currentValues.parentLastName && 
               currentValues.parentPhone && currentValues.parentEmail && 
               currentValues.homeAddress && currentValues.city && currentValues.state &&
               currentValues.emergencyContactName && currentValues.emergencyContactPhone && 
               currentValues.emergencyContactRelation;
      case 3:
        return currentValues.medicalAuthorization;
      case 4:
        return currentValues.termsAccepted;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      nextStep();
    } else {
      toast({
        title: "Please fill in all required fields",
        description: "Complete all required information before proceeding.",
        variant: "destructive",
      });
    }
  };

  if (registrationComplete && completedRegistration) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-temple-darkblue mb-4">Registration Complete!</h2>
          <p className="text-lg text-gray-600 mb-6">Thank you for registering for Build Our Future Summer Camp 2024</p>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold text-temple-darkblue mb-2">Registration Details</h3>
              <div className="text-left space-y-1">
                <p className="text-sm"><strong>Registration ID:</strong> {completedRegistration.registrationId}</p>
                <p className="text-sm"><strong>Child:</strong> {completedRegistration.childFirstName} {completedRegistration.childLastName}</p>
                <p className="text-sm"><strong>Program:</strong> {getProgramName(completedRegistration.program)}</p>
                <p className="text-sm"><strong>Amount:</strong> ${completedRegistration.registrationFee}</p>
              </div>
            </CardContent>
          </Card>
          <p className="text-sm text-gray-600 mt-4">A confirmation email has been sent to your registered email address.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`step-indicator ${currentStep >= step ? 'active' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-temple-orange text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className="text-sm mt-2 block">
                  {step === 1 && "Child Info"}
                  {step === 2 && "Parent Info"}
                  {step === 3 && "Medical"}
                  {step === 4 && "Payment"}
                </span>
              </div>
              {index < 3 && (
                <div className={`w-8 h-1 mx-2 ${
                  currentStep > step ? 'bg-temple-orange' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Child Information */}
            {currentStep === 1 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-temple-darkblue mb-6">Child Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="childFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter first name" />
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Program Selection *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cultural-5-9">Cultural Heritage (Ages 5-9) - June 15-July 15</SelectItem>
                            <SelectItem value="educational-8-12">Educational Excellence (Ages 8-12) - July 20-August 20</SelectItem>
                            <SelectItem value="leadership-12-15">Community Leadership (Ages 12-15) - August 25-September 15</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Grade Level (Fall 2024)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Kindergarten, 1st Grade, 2nd Grade" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialInterests"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Special Interests/Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Any special interests, hobbies, or notes about your child" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end mt-8">
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="bg-temple-orange hover:bg-temple-saffron text-white"
                  >
                    Next: Parent Information
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Parent Information */}
            {currentStep === 2 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-temple-darkblue mb-6">Parent/Guardian Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-temple-blue mb-4">Primary Contact</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="parentFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Parent/Guardian first name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Parent/Guardian last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="homeAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Home Address *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Street address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-temple-blue mb-4">Emergency Contact</h3>
                  </div>
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
                          <Input {...field} type="tel" placeholder="(555) 987-6543" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContactRelation"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Relationship to Child *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Grandmother, Uncle, Family Friend" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    onClick={prevStep}
                    variant="outline"
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="bg-temple-orange hover:bg-temple-saffron text-white"
                  >
                    Next: Medical Information
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Medical Information */}
            {currentStep === 3 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-temple-darkblue mb-6">Medical & Dietary Information</h2>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Known Allergies</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="List any food allergies, environmental allergies, or other relevant allergies" />
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
                          <Textarea {...field} rows={3} placeholder="List any medical conditions, chronic illnesses, or health concerns" />
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
                        <FormLabel>Current Medications</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="List any medications your child takes regularly, including dosage and timing" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel className="text-base font-medium">Dietary Restrictions</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Nut-free"].map((restriction) => (
                        <FormField
                          key={restriction}
                          control={form.control}
                          name="dietaryRestrictions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(restriction)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, restriction]);
                                    } else {
                                      field.onChange(current.filter((item) => item !== restriction));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {restriction}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="otherDietaryNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Dietary Restrictions or Preferences</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} placeholder="Other dietary restrictions or preferences" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="physicianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Physician Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Child's primary care physician" />
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
                          <FormLabel>Physician Phone</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" placeholder="(555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-temple-cream p-4 rounded-lg">
                    <h4 className="font-semibold text-temple-darkblue mb-2">Authorization</h4>
                    <FormField
                      control={form.control}
                      name="medicalAuthorization"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I authorize Gokuldham Temple staff to seek emergency medical treatment for my child if needed. 
                              I understand that every effort will be made to contact me before any medical treatment is administered. *
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    onClick={prevStep}
                    variant="outline"
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="bg-temple-orange hover:bg-temple-saffron text-white"
                  >
                    Next: Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-temple-darkblue mb-6">Registration Fee & Payment</h2>
                
                {/* Fee Summary */}
                <div className="bg-temple-cream rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-temple-darkblue mb-4">Fee Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Program Fee (4 weeks)</span>
                      <span>$280.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meals & Snacks</span>
                      <span>$120.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materials & Activities</span>
                      <span>$50.00</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Registration Fee</span>
                        <span className="text-temple-orange">$450.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>* Early bird discount of $50 applied for registrations before May 1st</p>
                    <p>* Payment plans available - contact us for details</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-temple-darkblue">Payment Method</FormLabel>
                        <div className="grid md:grid-cols-3 gap-4">
                          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-temple-orange">
                            <input 
                              type="radio" 
                              value="credit-card" 
                              checked={field.value === "credit-card"}
                              onChange={() => field.onChange("credit-card")}
                              className="text-temple-orange" 
                            />
                            <div className="ml-3">
                              <i className="fas fa-credit-card text-temple-orange text-lg"></i>
                              <span className="block font-medium">Credit Card</span>
                            </div>
                          </label>
                          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-temple-orange">
                            <input 
                              type="radio" 
                              value="debit-card" 
                              checked={field.value === "debit-card"}
                              onChange={() => field.onChange("debit-card")}
                              className="text-temple-orange" 
                            />
                            <div className="ml-3">
                              <i className="fas fa-credit-card text-temple-blue text-lg"></i>
                              <span className="block font-medium">Debit Card</span>
                            </div>
                          </label>
                          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-temple-orange">
                            <input 
                              type="radio" 
                              value="bank-transfer" 
                              checked={field.value === "bank-transfer"}
                              onChange={() => field.onChange("bank-transfer")}
                              className="text-temple-orange" 
                            />
                            <div className="ml-3">
                              <i className="fas fa-university text-temple-saffron text-lg"></i>
                              <span className="block font-medium">Bank Transfer</span>
                            </div>
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
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
                            <FormLabel className="text-sm">
                              I agree to the terms and conditions, refund policy, and code of conduct for the summer camp program. *
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    onClick={prevStep}
                    variant="outline"
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="bg-temple-orange hover:bg-temple-saffron text-white"
                  >
                    {mutation.isPending ? "Processing..." : "Complete Registration"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}

function getProgramName(program: string): string {
  switch (program) {
    case "cultural-5-9":
      return "Cultural Heritage (Ages 5-9)";
    case "educational-8-12":
      return "Educational Excellence (Ages 8-12)";
    case "leadership-12-15":
      return "Community Leadership (Ages 12-15)";
    default:
      return program;
  }
}
