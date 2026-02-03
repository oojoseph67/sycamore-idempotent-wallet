import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  password!: string;
}
