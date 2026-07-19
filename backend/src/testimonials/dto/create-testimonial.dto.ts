import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsInt()
  @IsOptional()
  rating?: number;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
