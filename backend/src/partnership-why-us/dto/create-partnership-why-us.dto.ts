import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreatePartnershipWhyUsDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
