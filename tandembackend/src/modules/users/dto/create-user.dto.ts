import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RolUsuario } from '../../../generated/prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom_usuario!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ap_usuario!: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  tel_usuario?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email_usuario!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  cont_usuario!: string;

  @IsEnum(RolUsuario)
  rol_usuario!: RolUsuario;

  @IsOptional()
  @IsInt()
  id_empresa?: number;

  @IsOptional()
  @IsBoolean()
  primer_ingreso?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}