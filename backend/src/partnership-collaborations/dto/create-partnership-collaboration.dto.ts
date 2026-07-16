import { IsString, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';

export class CreatePartnershipCollaborationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsInt()
  @IsOptional()
  sort_order?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
