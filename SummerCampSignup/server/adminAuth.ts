import type { Request, Response, NextFunction } from "express";

// Admin credentials - in production, these should be stored securely
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123" // In production, use hashed passwords
};

declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
    adminUsername?: string;
  }
}

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Check credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set admin session
    req.session.isAdmin = true;
    req.session.adminUsername = username;

    res.json({ 
      message: "Login successful",
      admin: { username }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminLogout = (req: Request, res: Response) => {
  req.session.isAdmin = false;
  req.session.adminUsername = undefined;
  
  res.json({ message: "Logout successful" });
};

export const getAdminProfile = (req: Request, res: Response) => {
  if (!req.session.isAdmin) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json({
    username: req.session.adminUsername,
    isAdmin: true
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAdmin) {
    return res.status(401).json({ message: "Admin access required" });
  }

  next();
};