import {
  IsInt,
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;
}

export class CreateInvoiceDto {
  @IsInt()
  patient_id: number;

  @IsInt()
  @IsOptional()
  appointment_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsDateString()
  due_date: string;

  @IsString()
  @IsOptional()
  payment_type?: string;

  @IsInt()
  @IsOptional()
  parent_invoice_id?: number;

  @IsInt()
  @IsOptional()
  dp_percentage?: number;
}
