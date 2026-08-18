import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmpresaDto) {
    const { inicio_empresa, fin_empresa, ...empresaData } = data;

    return this.prisma.empresa.create({
      data: {
        ...empresaData,
        ...(inicio_empresa !== undefined && {
          inicio_empresa: new Date(inicio_empresa),
        }),
        ...(fin_empresa !== undefined && {
          fin_empresa: new Date(fin_empresa),
        }),
      },
    });
  }

  async findAll() {
    return this.prisma.empresa.findMany({
      orderBy: {
        id_empresa: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: {
        id_empresa: id,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  // ✅ NUEVO: Actualizar empresa
  async update(id: number, data: UpdateEmpresaDto) {
    await this.findOne(id);

    const { inicio_empresa, fin_empresa, ...empresaData } = data;

    return this.prisma.empresa.update({
      where: {
        id_empresa: id,
      },
      data: {
        ...empresaData,
        ...(inicio_empresa !== undefined && {
          inicio_empresa: new Date(inicio_empresa),
        }),
        ...(fin_empresa !== undefined && {
          fin_empresa: new Date(fin_empresa),
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.empresa.update({
      where: {
        id_empresa: id,
      },
      data: {
        activo: false,
      },
    });
  }
}
