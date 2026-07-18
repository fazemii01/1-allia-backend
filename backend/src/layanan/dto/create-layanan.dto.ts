import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LayananStatsDto {
  @IsString()
  durasi_sesi: string;

  @IsString()
  format_layanan: string;

  @IsString()
  mulai_dari: string;
}

export class LayananProgramDto {
  @IsString()
  title: string;

  @IsString()
  desc: string;

  @IsString()
  harga: string;
}

export class CreateLayananCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;
}

export class CreateLayananDto {
  @IsInt()
  kategori_id: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LayananStatsDto)
  stats?: LayananStatsDto;

  @IsArray()
  @IsOptional()
  mengapa_memilih?: string[];

  @IsArray()
  @IsOptional()
  isu_permasalahan?: string[];

  @IsArray()
  @IsOptional()
  programs?: LayananProgramDto[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  promo_active?: boolean;

  @IsString()
  @IsOptional()
  promo_label?: string;

  @IsString()
  @IsOptional()
  promo_price?: string;

  @IsString()
  @IsOptional()
  promo_ends_at?: string;
}
