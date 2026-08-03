import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nom_empresa!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  rfc_empresa!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  calle_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  ext_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  int_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  col_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  cp_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mpio_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  estado_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nom_resp_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ap_resp_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  tel_resp_empresa?: string;

  @IsOptional()
  @IsEmail()
  email_resp_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  giro_empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  num_empl_empresa?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  cod_empresa!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cues_empresa?: number;

  // ✅ AGREGADO: faltaban estos dos campos por completo en el DTO.
  // Con whitelist:true en el ValidationPipe global, NestJS los estaba
  // eliminando del body antes de que llegaran a Prisma, por eso nunca
  // se guardaban ni actualizaban las fechas de vigencia de la empresa.
  @IsOptional()
  @IsDateString()
  inicio_empresa?: string;

  @IsOptional()
  @IsDateString()
  fin_empresa?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}