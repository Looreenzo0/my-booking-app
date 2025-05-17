import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/appError";

/**
 * Middleware to validate request body against a Zod schema.
 * @param schema Zod schema for request validation
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.errors.map((e) => e.message).join(", ");
        next(new AppError(`Validation error: ${issues}`, 400));
      } else {
        // Unexpected error during validation
        next(new AppError("An unexpected validation error occurred", 500));
      }
    }
  };
};
