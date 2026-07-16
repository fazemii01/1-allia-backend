import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNumber()
  @IsNotEmpty()
  patient_id: number;

  @IsNumber()
  @IsNotEmpty()
  therapist_id: number;

  @IsDateString()
  @IsNotEmpty()
  scheduled_at: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  duration_minutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
