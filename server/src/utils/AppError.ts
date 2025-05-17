class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400); // StatusCodes.BAD_REQUEST
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404); // StatusCodes.NOT_FOUND
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401); // StatusCodes.UNAUTHORIZED
  }
}

class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403); // StatusCodes.FORBIDDEN
  }
}

export {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
