import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreatePartnershipDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  logo_url: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
