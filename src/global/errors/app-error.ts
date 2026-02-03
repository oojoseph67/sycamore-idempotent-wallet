import { StatusCodes, ReasonPhrases } from "http-status-codes";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // maintain proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  // static factory methods for common errors
  static badRequest({
    message = ReasonPhrases.BAD_REQUEST,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(message, StatusCodes.BAD_REQUEST, true, details);
  }

  static unauthorized({
    message = ReasonPhrases.UNAUTHORIZED,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(message, StatusCodes.UNAUTHORIZED, true, details);
  }

  static forbidden({
    message = ReasonPhrases.FORBIDDEN,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(message, StatusCodes.FORBIDDEN, true, details);
  }

  static notFound({
    message = ReasonPhrases.NOT_FOUND,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(message, StatusCodes.NOT_FOUND, true, details);
  }

  static conflict({
    message = ReasonPhrases.CONFLICT,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(message, StatusCodes.CONFLICT, true, details);
  }

  static unprocessableEntity({
    message = ReasonPhrases.UNPROCESSABLE_ENTITY,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(
      message,
      StatusCodes.UNPROCESSABLE_ENTITY,
      true,
      details
    );
  }

  static internalServerError({
    message = ReasonPhrases.INTERNAL_SERVER_ERROR,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(
      message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      details
    );
  }

  static tooManyRequests({
    message = ReasonPhrases.TOO_MANY_REQUESTS,
    details,
  }: {
    message: string;
    details?: any;
  }): AppError {
    return new AppError(message, StatusCodes.TOO_MANY_REQUESTS, true, details);
  }
}
