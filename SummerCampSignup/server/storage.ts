import { registrations, type Registration, type InsertRegistration } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationByEmail(email: string): Promise<Registration[]>;
  getRegistrationByTicket(ticketNumber: string, lastName: string): Promise<Registration | undefined>;
  getAllRegistrations(): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistrationStatus(id: number, status: string): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;
  getRegistrationStats(): Promise<{
    totalRegistrations: number;
    totalRevenue: number;
    pendingReviews: number;
    programStats: { program: string; count: number; capacity: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getRegistration(id: number): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
    return registration || undefined;
  }

  async getRegistrationByEmail(email: string): Promise<Registration[]> {
    const results = await db.select().from(registrations).where(eq(registrations.parentEmail, email));
    return results;
  }

  async getRegistrationByTicket(ticketNumber: string, lastName: string): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(
      and(
        eq(registrations.registrationId, ticketNumber),
        eq(registrations.childLastName, lastName)
      )
    );
    return registration || undefined;
  }

  async getAllRegistrations(): Promise<Registration[]> {
    const results = await db.select().from(registrations);
    return results.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    // Generate unique registration ID (e-ticket number)
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const registrationId = `BOF2025-${timestamp}${random}`;
    
    // Calculate fee based on program
    const programFees = {
      "cultural-5-9": "450.00",
      "educational-8-12": "450.00", 
      "leadership-12-15": "450.00"
    };
    
    const registrationData = {
      ...insertRegistration,
      registrationId,
      status: "pending" as const,
      paymentStatus: "pending" as const,
      registrationFee: programFees[insertRegistration.program as keyof typeof programFees] || "450.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const [registration] = await db
      .insert(registrations)
      .values(registrationData)
      .returning();
    return registration;
  }

  async updateRegistrationStatus(id: number, status: string): Promise<Registration | undefined> {
    const [registration] = await db
      .update(registrations)
      .set({ status, updatedAt: new Date() })
      .where(eq(registrations.id, id))
      .returning();
    return registration || undefined;
  }

  async deleteRegistration(id: number): Promise<boolean> {
    const result = await db
      .delete(registrations)
      .where(eq(registrations.id, id))
      .returning();
    return result.length > 0;
  }

  async getRegistrationStats(): Promise<{
    totalRegistrations: number;
    totalRevenue: number;
    pendingReviews: number;
    programStats: { program: string; count: number; capacity: number }[];
  }> {
    const allRegistrations = await db.select().from(registrations);
    
    const totalRegistrations = allRegistrations.length;
    const totalRevenue = allRegistrations
      .filter(r => r.paymentStatus === "completed")
      .reduce((sum, r) => sum + parseFloat(r.registrationFee), 0);
    const pendingReviews = allRegistrations.filter(r => r.status === "pending").length;
    
    const programCounts = new Map<string, number>();
    allRegistrations.forEach(r => {
      programCounts.set(r.program || "unknown", (programCounts.get(r.program || "unknown") || 0) + 1);
    });
    
    const programCapacities = {
      "cultural-5-9": 60,
      "educational-8-12": 60,
      "leadership-12-15": 45,
    };
    
    const programStats = Array.from(programCounts.entries()).map(([program, count]) => ({
      program,
      count,
      capacity: programCapacities[program as keyof typeof programCapacities] || 60,
    }));
    
    // Add programs with zero registrations
    Object.keys(programCapacities).forEach(program => {
      if (!programCounts.has(program)) {
        programStats.push({
          program,
          count: 0,
          capacity: programCapacities[program as keyof typeof programCapacities],
        });
      }
    });
    
    return {
      totalRegistrations,
      totalRevenue,
      pendingReviews,
      programStats,
    };
  }
}

export const storage = new DatabaseStorage();
