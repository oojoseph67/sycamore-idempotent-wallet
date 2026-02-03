import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";

/**
 * validates a plain object against a DTO class
 * @param dtoClass - the DTO class to validate against
 * @param data - the plain object to validate
 * @param skipMissingProperties - whether to skip validation for missing properties
 * @returns validation errors if any, null if valid
 */
export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: any,
  skipMissingProperties: boolean = false
): Promise<ValidationError[] | null> {
  const dto = plainToInstance(dtoClass, data, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });

  const errors = await validate(dto, {
    skipMissingProperties,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return errors.length > 0 ? errors : null;
}

/**
 * transforms a plain object to a DTO instance
 * @param dtoClass - the DTO class to transform to
 * @param data - the plain object to transform
 * @returns the transformed DTO instance
 */
export function transformToDto<T extends object>(
  dtoClass: new () => T,
  data: any
): T {
  return plainToInstance(dtoClass, data, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
}
