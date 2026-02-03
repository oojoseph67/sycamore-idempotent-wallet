import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
  IsNumberString,
  IsUUID,
} from "class-validator";
import { Expose } from "class-transformer";

export class TransferDto {
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^(0|[1-9]\d*)(\.\d+)?$/, {
    message: "amount must be a non-negative number",
  })
  amount!: string;

  @IsUUID()
  @IsNotEmpty()
  toUserId!: string;

  @IsUUID()
  @IsNotEmpty()
  idempotencyKey!: string;
}
