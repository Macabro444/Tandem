import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateEmpresaDto) {
    return this.prisma.empresa.create({
      data,
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

    return this.prisma.empresa.update({
      where: {
        id_empresa: id,
      },
      data,
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