import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '../../generated/prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(RolUsuario.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(RolUsuario.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @Get('empresa/:idEmpresa')
  findAllByEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number) {
    return this.usersService.findAllByEmpresa(idEmpresa);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @Get('licencias/empresa/:idEmpresa')
  getLicenciasByEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number) {
    return this.usersService.getLicenciasByEmpresa(idEmpresa);
  }

  // ✅ NUEVO: Cualquier usuario autenticado puede ver su propio perfil
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user?.id_usuario;
    if (!userId) {
      throw new BadRequestException('Usuario no autenticado');
    }
    return this.usersService.findOne(userId);
  }

  @Roles(RolUsuario.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const idEmpresa = req.user?.rol_usuario === 'COORDINADOR' ? req.user?.id_empresa : undefined;
    return this.usersService.update(id, updateUserDto, idEmpresa);
  }

  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const idEmpresa = req.user?.rol_usuario === 'COORDINADOR' ? req.user?.id_empresa : undefined;
    return this.usersService.remove(id, idEmpresa);
  }
}