import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    status: "error",
    message: err.message || "Internal Server Error",
    ...(isProduction
      ? null
      : {
          stack: err.stack,
          error: err,
        }),
  };

  res.status(statusCode).json(response);
};
