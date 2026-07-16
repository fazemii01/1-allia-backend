import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreatePartnershipMomentDto {
  @IsString()
  title: string;

  @IsString()
  img_url: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
