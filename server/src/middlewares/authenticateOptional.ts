import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { findUserById } from "../services/authService"; // Adjust the path if needed

export const authenticateOptional = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };
      const user = await findUserById(decoded.id);
      if (user) {
        (req as any).user = user;
      }
    } catch (err) {
      console.warn("Invalid token provided, proceeding as guest.");
    }
  }
  next();
};
