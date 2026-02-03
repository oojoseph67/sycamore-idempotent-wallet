import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from "class-validator";
import { Expose } from "class-transformer";

export class SignupDto {
  @IsEmail(
    {},
    {
      message: "email must be a valid email address",
    }
  )
  @IsNotEmpty({
    message: "email is required",
  })
  @Expose()
  email!: string;

  @IsString({
    message: "password must be a string",
  })
  @IsNotEmpty({
    message: "password is required",
  })
  @MinLength(8, {
    message: "password must be at least 8 characters long",
  })
  @MaxLength(100, {
    message: "password must not exceed 100 characters",
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      "Minimum eight characters, at least one letter, one number and one special character",
  })
  @Expose()
  password!: string;

  @IsString({
    message: "firstName must be a string",
  })
  @IsNotEmpty({
    message: "firstName is required",
  })
  @MinLength(2, {
    message: "firstName must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "firstName must not exceed 50 characters",
  })
  @Expose()
  firstName!: string;

  @IsString({
    message: "lastName must be a string",
  })
  @IsNotEmpty({
    message: "lastName is required",
  })
  @MinLength(2, {
    message: "lastName must be at least 2 characters long",
  })
  @MaxLength(50, {
    message: "lastName must not exceed 50 characters",
  })
  @Expose()
  lastName!: string;
}
