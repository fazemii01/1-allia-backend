import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  image_url: string;

  @IsString()
  @IsOptional()
  mobile_image_url?: string;

  @IsString()
  @IsOptional()
  href?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  popup_delay?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
