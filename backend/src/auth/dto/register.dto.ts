import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  whatsapp: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsString()
  @IsNotEmpty()
  child_name: string;

  @IsNumber()
  @Min(0)
  @Max(18)
  child_age: number;

  @IsString()
  @IsNotEmpty()
  child_tempat_lahir: string;

  @IsString()
  @IsNotEmpty()
  child_tanggal_lahir: string;

  @IsString()
  @IsNotEmpty()
  child_jenis_kelamin: string;
}
