import { IsString, IsOptional, IsEmail, IsEnum, IsBoolean, IsNumber, MinLength } from 'class-validator';
import { RolUsuario } from '../../../generated/prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nom_usuario?: string;

  @IsString()
  @IsOptional()
  ap_usuario?: string;

  @IsString()
  @IsOptional()
  tel_usuario?: string;

  @IsEmail()
  @IsOptional()
  email_usuario?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  cont_usuario?: string;

  @IsEnum(RolUsuario)
  @IsOptional()
  rol_usuario?: RolUsuario;

  @IsNumber()
  @IsOptional()
  id_empresa?: number;

  @IsBoolean()
  @IsOptional()
  primer_ingreso?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}