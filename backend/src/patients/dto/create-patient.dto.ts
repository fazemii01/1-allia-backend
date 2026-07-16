import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  IsObject,
  IsDateString,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  nama_lengkap: string;

  @IsOptional()
  @IsNumber()
  usia?: number;

  @IsOptional()
  @IsString()
  tempat_lahir?: string;

  @IsOptional()
  @IsDateString()
  tanggal_lahir?: string;

  @IsOptional()
  @IsString()
  jenis_kelamin?: string;

  @IsOptional()
  @IsEmail()
  email_ortu?: string;

  @IsOptional()
  @IsString()
  no_telepon?: string;

  @IsOptional()
  @IsString()
  nama_ayah?: string;

  @IsOptional()
  @IsString()
  nama_ibu?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  jenis_terapi?: string;

  @IsOptional()
  @IsString()
  pendidikan_anak?: string;

  @IsOptional()
  @IsString()
  relasi_sosial?: string;

  @IsOptional()
  @IsString()
  relasi_dengan_ibu?: string;

  @IsOptional()
  @IsString()
  relasi_dengan_saudara?: string;

  @IsOptional()
  @IsObject()
  formulir_wicara?: Record<string, any>;

  @IsOptional()
  @IsObject()
  formulir_hipoterapi?: Record<string, any>;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  therapist_id?: number;

  @IsOptional()
  @IsString()
  catatan_internal?: string;
}
