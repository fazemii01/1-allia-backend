import { IsInt, IsOptional, IsString, IsObject, IsNumber } from 'class-validator';

export class CreateTherapyProgressLogDto {
  @IsInt()
  patient_id: number;

  @IsInt()
  @IsOptional()
  therapist_id?: number;

  @IsString()
  @IsOptional()
  program_name?: string;

  @IsInt()
  @IsOptional()
  total_sessions?: number;

  @IsInt()
  @IsOptional()
  session_number?: number;

  @IsString()
  @IsOptional()
  session_date?: string;

  @IsString()
  @IsOptional()
  fokus_latihan?: string;

  @IsNumber()
  @IsOptional()
  progress_score?: number;

  @IsObject()
  @IsOptional()
  aspect_scores?: {
    atensi_fokus?: number;
    artikulasi_wicara?: number;
    regulasi_emosi?: number;
    kepatuhan_instruksi?: number;
    sosialisasi?: number;
  };

  @IsString()
  @IsOptional()
  catatan_terapis?: string;

  @IsString()
  @IsOptional()
  rekomendasi_ortu?: string;

  @IsString()
  @IsOptional()
  status_pencapaian?: string;
}
