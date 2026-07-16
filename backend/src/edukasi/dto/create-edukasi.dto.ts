import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateEdukasiDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsIn(['buku_saku', 'artikel', 'galeri'])
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  cover_url?: string;

  @IsString()
  @IsOptional()
  file_url?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}
