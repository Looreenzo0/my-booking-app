import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";
import { AppError } from "../utils/appError";

/**
 * Middleware to authorize users based on roles.
 * @param allowedRoles List of allowed roles as strings, e.g. ['admin', 'user']
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return next(new AppError("Unauthorized: User not authenticated", 401));
      }

      // Normalize roles to lowercase for case-insensitive comparison (optional)
      const userRole = req.user.role.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map((role) =>
        role.toLowerCase()
      );

      if (!normalizedAllowedRoles.includes(userRole)) {
        return next(new AppError("Forbidden: Insufficient permissions", 403));
      }

      next();
    } catch (error) {
      next(new AppError("Authorization error", 500));
    }
  };
};
