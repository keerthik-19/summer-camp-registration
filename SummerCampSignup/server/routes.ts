import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { sendRegistrationConfirmation, sendPaymentReminder } from "./email";
import { adminLogin, adminLogout, getAdminProfile, requireAdmin } from "./adminAuth";
import { db } from "./db";
import { insertRegistrationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure sessions
  app.use(session({
    secret: process.env.SESSION_SECRET || 'temple-admin-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Admin authentication routes
  app.post('/api/admin/login', adminLogin);
  app.post('/api/admin/logout', requireAdmin, adminLogout);
  app.get('/api/admin/me', getAdminProfile);

  // Database administration routes
  app.get('/api/admin/database/info', requireAdmin, async (req, res) => {
    try {
      const result = await db.execute("SELECT current_database() as database, version() as version");
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to get database info" });
    }
  });

  app.get('/api/admin/database/tables', requireAdmin, async (req, res) => {
    try {
      const result = await db.execute(`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tables" });
    }
  });

  app.post('/api/admin/database/execute', requireAdmin, async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }

      // Basic safety check - prevent destructive operations in production
      const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
      const upperQuery = query.toUpperCase();
      
      if (process.env.NODE_ENV === 'production') {
        for (const keyword of dangerousKeywords) {
          if (upperQuery.includes(keyword)) {
            return res.status(403).json({ 
              message: `Dangerous operation '${keyword}' not allowed in production` 
            });
          }
        }
      }

      const result = await db.execute(query);
      res.json({
        rows: result.rows,
        rowCount: result.rowCount,
        query: query
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Query execution failed", 
        error: error.message 
      });
    }
  });

  app.post('/api/admin/database/backup', requireAdmin, async (req, res) => {
    try {
      // Get all registrations data
      const registrations = await storage.getAllRegistrations();
      
      // Create SQL backup content
      const backupContent = `-- Temple Summer Camp Database Backup
-- Generated on: ${new Date().toISOString()}

-- Registrations Table Data
${registrations.map(reg => 
  `INSERT INTO registrations (${Object.keys(reg).join(', ')}) VALUES (${Object.values(reg).map(v => 
    typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
  ).join(', ')});`
).join('\n')}
`;

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="temple_backup_${new Date().toISOString().split('T')[0]}.sql"`);
      res.send(backupContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to create backup" });
    }
  });
  // Get all registrations (admin only)
  app.get("/api/registrations", requireAdmin, async (req, res) => {
    try {
      const registrations = await storage.getAllRegistrations();
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Get registration by ID
  app.get("/api/registrations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid registration ID" });
      }
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registration" });
    }
  });

  // Create new registration
  app.post("/api/registrations", async (req, res) => {
    try {
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Set registration fee based on program
      const fees = {
        "cultural-5-9": "450.00",
        "educational-8-12": "450.00",
        "leadership-12-15": "450.00",
      };
      
      const registrationData = {
        ...validatedData,
        registrationFee: fees[validatedData.program as keyof typeof fees] || "450.00",
        paymentStatus: "pending", // Default to pending payment
        status: "confirmed",
      };
      
      const registration = await storage.createRegistration(registrationData);
      
      // Send confirmation email
      const emailSent = await sendRegistrationConfirmation(registration);
      if (!emailSent) {
        console.warn(`Failed to send confirmation email for registration ${registration.registrationId}`);
      }
      
      res.status(201).json({
        ...registration,
        emailSent
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      }
      
      // Handle duplicate registration errors
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(409).json({ 
          message: "This child is already registered for this program, or this email is already used for this program",
          error: "Duplicate registration"
        });
      }
      
      console.error("Registration creation error:", error);
      res.status(500).json({ message: "Failed to create registration" });
    }
  });

  // Send payment reminder email (admin only)
  app.post("/api/registrations/:id/send-reminder", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid registration ID" });
      }
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      const emailSent = await sendPaymentReminder(registration);
      
      res.json({ 
        success: emailSent,
        message: emailSent ? "Payment reminder sent successfully" : "Failed to send payment reminder"
      });
    } catch (error) {
      console.error("Failed to send payment reminder:", error);
      res.status(500).json({ message: "Failed to send payment reminder" });
    }
  });

  // Send bulk payment reminders (admin only)
  app.post("/api/registrations/bulk-reminder", requireAdmin, async (req, res) => {
    try {
      const { registrationIds } = req.body;
      
      if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
        return res.status(400).json({ message: "Invalid registration IDs" });
      }
      
      const results = [];
      
      for (const id of registrationIds) {
        try {
          const registration = await storage.getRegistration(id);
          if (registration) {
            const emailSent = await sendPaymentReminder(registration);
            results.push({
              registrationId: id,
              success: emailSent,
              childName: `${registration.childFirstName} ${registration.childLastName}`
            });
          } else {
            results.push({
              registrationId: id,
              success: false,
              error: "Registration not found"
            });
          }
        } catch (error) {
          results.push({
            registrationId: id,
            success: false,
            error: "Failed to send email"
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      res.json({
        message: `Sent ${successCount} out of ${registrationIds.length} payment reminders`,
        results
      });
    } catch (error) {
      console.error("Failed to send bulk payment reminders:", error);
      res.status(500).json({ message: "Failed to send bulk payment reminders" });
    }
  });

  // Update registration status (admin only)
  app.patch("/api/registrations/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid registration ID" });
      }
      
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const registration = await storage.updateRegistrationStatus(id, status);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to update registration status" });
    }
  });

  // Delete registration (admin only)
  app.delete("/api/registrations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid registration ID" });
      }
      
      const deleted = await storage.deleteRegistration(id);
      if (!deleted) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json({ message: "Registration deleted successfully" });
    } catch (error) {
      console.error("Error deleting registration:", error);
      res.status(500).json({ message: "Failed to delete registration" });
    }
  });

  // Get registration statistics (admin only)
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getRegistrationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // E-ticket lookup - find registration by ticket number and last name
  app.post("/api/registrations/lookup", async (req, res) => {
    try {
      const { ticketNumber, lastName } = req.body;
      
      if (!ticketNumber || !lastName) {
        return res.status(400).json({ 
          message: "Please provide both ticket number and child's last name" 
        });
      }
      
      const registration = await storage.getRegistrationByTicket(ticketNumber.trim(), lastName.trim());
      
      if (!registration) {
        return res.status(404).json({ 
          message: "No registration found with the provided ticket number and last name" 
        });
      }
      
      res.json(registration);
    } catch (error) {
      console.error("Registration lookup error:", error);
      res.status(500).json({ message: "Failed to lookup registration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
