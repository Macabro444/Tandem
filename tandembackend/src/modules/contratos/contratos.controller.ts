import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '../../generated/prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Controller('contratos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Roles(RolUsuario.ADMIN)
  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratosService.create(createContratoDto);
  }

  @Roles(RolUsuario.ADMIN)
  @Get()
  findAll() {
    return this.contratosService.findAll();
  }

  @Roles(RolUsuario.ADMIN)
  @Get('empresa/:idEmpresa')
  findByEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number) {
    return this.contratosService.findByEmpresa(idEmpresa);
  }

  @Roles(RolUsuario.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contratosService.findOne(id);
  }

  @Roles(RolUsuario.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContratoDto: UpdateContratoDto,
  ) {
    return this.contratosService.update(id, updateContratoDto);
  }

  @Roles(RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contratosService.remove(id);
  }
}