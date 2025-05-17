import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/appError";
interface JwtPayload extends DefaultJwtPayload {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("No token provided", 401));
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new AppError("JWT secret not configured", 500));
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded?.id || !decoded?.role) {
      return next(new AppError("Invalid token payload", 401));
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return next(new AppError("Token is invalid or expired", 401));
  }
};
