import { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AppError } from "../global/errors";
import { config } from "../config/env";
import { ValidationError } from "class-validator";

// example middleware
export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

// wrapper utility for async route handlers that auto-send return values
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => any
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(req, res, next);
      // if handler returned a value and response wasn't sent, send it
      if (result !== undefined && !res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  };
};

// response interceptor middleware
export const responseInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (body?: any) {
    // skip formatting if response is already formatted or is an error
    if (
      body &&
      typeof body === "object" &&
      ("success" in body || "error" in body || "statusCode" in body)
    ) {
      return originalJson(body);
    }

    // format the response
    const formatted = {
      success: true,
      data: body,
    };

    return originalJson(formatted);
  };

  next();
};

// error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if response already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  // handle AppError instances
  if (err instanceof AppError) {
    const errorResponse = {
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        ...(err.details && { details: err.details }),
        ...(config.nodeEnv === "development" && { stack: err.stack }),
      },
    };

    return res.status(err.statusCode).json(errorResponse);
  }

  // handle class-validator errors (already formatted as AppError)
  if (
    err instanceof AppError &&
    err.statusCode === StatusCodes.UNPROCESSABLE_ENTITY
  ) {
    // already handled by validation middleware
    const errorResponse = {
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        ...(err.details && { details: err.details }),
        ...(config.nodeEnv === "development" && { stack: err.stack }),
      },
    };

    return res.status(err.statusCode).json(errorResponse);
  }

  // handle validation errors (e.g., from joi)
  if (err.name === "ValidationError" || err.name === "JoiValidationError") {
    const errorResponse = {
      success: false,
      error: {
        message: err.message || ReasonPhrases.BAD_REQUEST,
        statusCode: StatusCodes.BAD_REQUEST,
        ...(config.nodeEnv === "development" && { stack: err.stack }),
      },
    };

    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }

  // handle sequelize errors (unique constraint, validation, etc.)
  if (err.name === "SequelizeUniqueConstraintError" || err.name === "SequelizeValidationError") {
    const errorResponse = {
      success: false,
      error: {
        message: "database operation failed",
        statusCode: StatusCodes.BAD_REQUEST,
        ...(config.nodeEnv === "development" && {
          details: err.message,
          stack: err.stack,
        }),
      },
    };

    return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
  }

  // handle unknown errors
  const errorResponse = {
    success: false,
    error: {
      message:
        config.nodeEnv === "production"
          ? ReasonPhrases.INTERNAL_SERVER_ERROR
          : err.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      ...(config.nodeEnv === "development" && { stack: err.stack }),
    },
  };

  // log error for debugging
  console.error("unhandled error:", err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
};

// export validation middleware
export { validateRequest } from "./validation.middleware";

// export rate limiter
export { createRateLimiter, rateLimiter } from "./rate-limiter";
