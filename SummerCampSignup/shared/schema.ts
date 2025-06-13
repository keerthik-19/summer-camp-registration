import { pgTable, text, serial, integer, boolean, timestamp, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  
  // Child Information
  childFirstName: text("child_first_name").notNull(),
  childLastName: text("child_last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  gradeCompleting: text("grade_completing").notNull(),
  
  // Parent/Guardian Information
  parentGuardianName: text("parent_guardian_name").notNull(),
  relationship: text("relationship").notNull(),
  parentEmail: text("parent_email").notNull(),
  parentPhone: text("parent_phone").notNull(),
  homeAddress: text("home_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  
  // Emergency Contact
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  emergencyContactRelation: text("emergency_contact_relation").notNull(),
  
  // Medical Information
  physicianName: text("physician_name"),
  physicianPhone: text("physician_phone"),
  medicalInsurance: text("medical_insurance"),
  allergies: text("allergies"),
  medications: text("medications"),
  medicalConditions: text("medical_conditions"),
  dietaryRestrictions: text("dietary_restrictions"),
  tshirtSize: text("tshirt_size"),
  
  // Program Selection
  program: text("program").notNull().default("summer-camp"),
  sessionDates: text("session_dates").notNull(),
  
  // Additional Information
  specialAccommodations: text("special_accommodations"),
  previousAttendance: boolean("previous_attendance").default(false),
  howDidYouHear: text("how_did_you_hear"),
  
  // Authorization and Agreements
  pickupAuthorization: text("pickup_authorization").notNull(),
  photoVideoConsent: boolean("photo_video_consent").default(false),
  medicalTreatmentConsent: boolean("medical_treatment_consent").default(false),
  liabilityWaiver: boolean("liability_waiver").default(false),
  
  // Payment Information
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  
  // Terms and Conditions
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  
  // Metadata
  registrationId: text("registration_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  registrationId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;
