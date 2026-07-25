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
  @IsOptional()
  durasi_sesi?: string;

  @IsString()
  @IsOptional()
  format_layanan?: string;

  @IsString()
  @IsOptional()
  mulai_dari?: string;
}

export class LayananProgramDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsString()
  @IsOptional()
  harga?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  total_sesi?: number;
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
  @Type(() => Number)
  sort_order?: number;
}

export class CreateLayananDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  kategori_id?: number;

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
  @ValidateNested({ each: true })
  @Type(() => LayananProgramDto)
  programs?: LayananProgramDto[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  promo_active?: boolean;

  @IsBoolean()
  @IsOptional()
  allow_dp?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  dp_percentage?: number;

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

