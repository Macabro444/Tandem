import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  private calcularEstadoContrato(contrato: {
    activo: boolean;
    fecha_inicio: Date;
    fecha_fin: Date;
    total_licencias: number;
    licencias_usadas: number;
    total_cuestionarios: number;
    cuestionarios_usados: number;
  }) {
    const hoy = new Date();

    if (!contrato.activo) {
      return 'INACTIVO';
    }

    if (hoy < contrato.fecha_inicio) {
      return 'PENDIENTE';
    }

    if (hoy > contrato.fecha_fin) {
      return 'VENCIDO';
    }

    const licenciasAgotadas =
      contrato.licencias_usadas >= contrato.total_licencias;

    const cuestionariosAgotados =
      contrato.cuestionarios_usados >= contrato.total_cuestionarios;

    if (licenciasAgotadas || cuestionariosAgotados) {
      return 'AGOTADO';
    }

    return 'ACTIVO';
  }

  private agregarEstado(contrato: any) {
    return {
      ...contrato,
      estado_contrato: this.calcularEstadoContrato(contrato),
      licencias_disponibles:
        contrato.total_licencias - contrato.licencias_usadas,
      cuestionarios_disponibles:
        contrato.total_cuestionarios - contrato.cuestionarios_usados,
    };
  }

  async create(data: CreateContratoDto) {
    const empresa = await this.prisma.empresa.findUnique({
      where: {
        id_empresa: data.id_empresa,
      },
    });

    if (!empresa) {
      throw new NotFoundException('La empresa no existe');
    }

    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha fin debe ser mayor a la fecha inicio',
      );
    }

    const contrato = await this.prisma.contrato.create({
      data: {
        id_empresa: data.id_empresa,
        nombre_contrato: data.nombre_contrato,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        total_licencias: data.total_licencias,
        licencias_usadas: data.licencias_usadas ?? 0,
        total_cuestionarios: data.total_cuestionarios,
        cuestionarios_usados: data.cuestionarios_usados ?? 0,
        activo: data.activo ?? true,
      },
      include: {
        empresa: true,
      },
    });

    return this.agregarEstado(contrato);
  }

  async findAll() {
    const contratos = await this.prisma.contrato.findMany({
      include: {
        empresa: true,
      },
      orderBy: {
        id_contrato: 'asc',
      },
    });

    return contratos.map((contrato) => this.agregarEstado(contrato));
  }

  async findOne(id: number) {
    const contrato = await this.prisma.contrato.findUnique({
      where: {
        id_contrato: id,
      },
      include: {
        empresa: true,
      },
    });

    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return this.agregarEstado(contrato);
  }

  async findByEmpresa(idEmpresa: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: {
        id_empresa: idEmpresa,
      },
    });

    if (!empresa) {
      throw new NotFoundException('La empresa no existe');
    }

    const contratos = await this.prisma.contrato.findMany({
      where: {
        id_empresa: idEmpresa,
      },
      include: {
        empresa: true,
      },
      orderBy: {
        id_contrato: 'asc',
      },
    });

    return contratos.map((contrato) => this.agregarEstado(contrato));
  }

  async update(id: number, data: UpdateContratoDto) {
    await this.findOne(id);

    if (data.fecha_inicio && data.fecha_fin) {
      const fechaInicio = new Date(data.fecha_inicio);
      const fechaFin = new Date(data.fecha_fin);

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException(
          'La fecha fin debe ser mayor a la fecha inicio',
        );
      }
    }

    const contrato = await this.prisma.contrato.update({
      where: {
        id_contrato: id,
      },
      data: {
        ...(data.id_empresa !== undefined && {
          id_empresa: data.id_empresa,
        }),
        ...(data.nombre_contrato !== undefined && {
          nombre_contrato: data.nombre_contrato,
        }),
        ...(data.fecha_inicio !== undefined && {
          fecha_inicio: new Date(data.fecha_inicio),
        }),
        ...(data.fecha_fin !== undefined && {
          fecha_fin: new Date(data.fecha_fin),
        }),
        ...(data.total_licencias !== undefined && {
          total_licencias: data.total_licencias,
        }),
        ...(data.licencias_usadas !== undefined && {
          licencias_usadas: data.licencias_usadas,
        }),
        ...(data.total_cuestionarios !== undefined && {
          total_cuestionarios: data.total_cuestionarios,
        }),
        ...(data.cuestionarios_usados !== undefined && {
          cuestionarios_usados: data.cuestionarios_usados,
        }),
        ...(data.activo !== undefined && {
          activo: data.activo,
        }),
      },
      include: {
        empresa: true,
      },
    });

    return this.agregarEstado(contrato);
  }

  async remove(id: number) {
    await this.findOne(id);

    const contrato = await this.prisma.contrato.update({
      where: {
        id_contrato: id,
      },
      data: {
        activo: false,
      },
      include: {
        empresa: true,
      },
    });

    return this.agregarEstado(contrato);
  }
}