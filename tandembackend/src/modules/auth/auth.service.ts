import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!user.activo) {
      throw new UnauthorizedException('El usuario está inactivo');
    }

    const passwordValid = await bcrypt.compare(
      loginDto.cont_usuario,
      user.cont_usuario,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = {
      sub: user.id_usuario,
      username: user.username,
      rol_usuario: user.rol_usuario,
      id_empresa: user.id_empresa,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { cont_usuario, ...userWithoutPassword } = user;

    return {
      message: 'Login correcto',
      access_token: accessToken,
      user: userWithoutPassword,
    };
  }
}