import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? false;
  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    status: isOperational ? err.status || "fail" : "error",
    message: isOperational ? err.message : "Something went very wrong!",
    ...(isProduction
      ? null
      : {
          stack: err.stack,
          error: err,
        }),
  };

  res.status(statusCode).json(response);
};
