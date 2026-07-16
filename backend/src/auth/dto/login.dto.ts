import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';

/**
 * Login supports either:
 *  - email + password
 *  - whatsapp + password
 * At least one of email/whatsapp must be provided (validated in AuthService).
 */
export class LoginDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
