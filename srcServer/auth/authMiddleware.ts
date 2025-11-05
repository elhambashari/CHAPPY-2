
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    (req as any).user = null;
    return next();
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
  } catch (error) {
    console.error("❌ Invalid token:", error);
    (req as any).user = null;
  }

  next();
};


export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("❌ Invalid token:", error);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};
