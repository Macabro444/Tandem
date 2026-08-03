import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,  // ✅ Importar Put
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '../../generated/prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto'; // ✅ Importar

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Post()
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @Get()
  findAll() {
    return this.empresasService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.findOne(id);
  }

  // ✅ NUEVO: Actualizar empresa
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    return this.empresasService.update(id, updateEmpresaDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.remove(id);
  }

  
}