import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  image_url: string;

  @IsString()
  @IsOptional()
  href?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
