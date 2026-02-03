import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { AppError } from "../global/errors";
import { StatusCodes } from "http-status-codes";

type ValidationTarget = "body" | "query" | "params";

/**
 * validation middleware factory - creates middleware to validate request data
 * @param dtoClass - the DTO class to validate against
 * @param target - which part of the request to validate (body, query, or params)
 * @param skipMissingProperties - whether to skip validation for missing properties
 */
export const validateRequest = <T extends object>(
  dtoClass: new () => T,
  target: ValidationTarget = "body",
  skipMissingProperties: boolean = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[target];

    // transform plain object to class instance
    const dto = plainToInstance(dtoClass, dataToValidate, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });

    // validate the dto
    const errors: ValidationError[] = await validate(dto, {
      skipMissingProperties,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const formattedErrors = formatValidationErrors(errors);
      throw AppError.unprocessableEntity({
        message: "validation failed",
        details: formattedErrors,
      });
    }

    // attach validated and transformed data to request
    req[target] = dto as any;
    next();
  };
};

/**
 * formats validation errors into a readable structure
 */
const formatValidationErrors = (errors: ValidationError[]): any => {
  return errors.map((error) => {
    const formatted: any = {
      property: error.property,
      constraints: error.constraints,
    };

    // recursively format nested validation errors
    if (error.children && error.children.length > 0) {
      formatted.children = formatValidationErrors(error.children);
    }

    return formatted;
  });
};
