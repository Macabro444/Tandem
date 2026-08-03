import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateContratoDto {
  @IsInt()
  id_empresa!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre_contrato!: string;

  @IsDateString()
  fecha_inicio!: string;

  @IsDateString()
  fecha_fin!: string;

  @IsInt()
  @Min(1)
  total_licencias!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  licencias_usadas?: number;

  @IsInt()
  @Min(1)
  total_cuestionarios!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cuestionarios_usados?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}