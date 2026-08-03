import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private usuarioConsumeLicencia(rol: RolUsuario): boolean {
    return rol === RolUsuario.EMPLEADO || rol === RolUsuario.COORDINADOR;
  }

  private calcularEstadoContrato(contrato: {
    activo: boolean;
    fecha_inicio: Date;
    fecha_fin: Date;
    total_licencias: number;
    licencias_usadas: number;
  }) {
    const hoy = new Date();

    if (!contrato.activo) return 'INACTIVO';
    if (hoy < contrato.fecha_inicio) return 'PENDIENTE';
    if (hoy > contrato.fecha_fin) return 'VENCIDO';
    if (contrato.licencias_usadas >= contrato.total_licencias) return 'AGOTADO';

    return 'ACTIVO';
  }

  private async getContratoActivo(idEmpresa: number) {
    const contrato = await this.prisma.contrato.findFirst({
      where: {
        id_empresa: idEmpresa,
        activo: true,
      },
      orderBy: {
        fecha_fin: 'desc',
      },
    });

    if (!contrato) {
      throw new BadRequestException('La empresa no tiene un contrato activo');
    }

    const estado = this.calcularEstadoContrato(contrato);

    if (estado !== 'ACTIVO') {
      throw new BadRequestException(
        `El contrato de la empresa está ${estado}. No se pueden gestionar licencias.`,
      );
    }

    return contrato;
  }

  private async actualizarNumEmpleados(idEmpresa: number) {
    if (!idEmpresa) return;

    const count = await this.prisma.usuario.count({
      where: {
        id_empresa: idEmpresa,
        activo: true,
        rol_usuario: {
          in: [RolUsuario.EMPLEADO, RolUsuario.COORDINADOR],
        },
      },
    });

    await this.prisma.empresa.update({
      where: { id_empresa: idEmpresa },
      data: { num_empl_empresa: count.toString() },
    });
  }

  async create(data: CreateUserDto) {
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email_usuario: data.email_usuario },
    });
    if (existingEmail) {
      throw new ConflictException('El correo ya está registrado');
    }

    const existingUsername = await this.prisma.usuario.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new ConflictException('El username ya está registrado');
    }

    let contratoActivo: any = null;
    if (this.usuarioConsumeLicencia(data.rol_usuario)) {
      if (!data.id_empresa) {
        throw new BadRequestException(
          'Los usuarios COORDINADOR y EMPLEADO deben pertenecer a una empresa',
        );
      }

      const empresa = await this.prisma.empresa.findUnique({
        where: { id_empresa: data.id_empresa },
      });
      if (!empresa) {
        throw new NotFoundException('La empresa no existe');
      }

      contratoActivo = await this.getContratoActivo(data.id_empresa);

      if (contratoActivo.licencias_usadas >= contratoActivo.total_licencias) {
        throw new BadRequestException('La empresa ya no tiene licencias disponibles');
      }
    }

    const hashedPassword = await bcrypt.hash(data.cont_usuario, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          nom_usuario: data.nom_usuario,
          ap_usuario: data.ap_usuario,
          tel_usuario: data.tel_usuario,
          email_usuario: data.email_usuario,
          username: data.username,
          cont_usuario: hashedPassword,
          rol_usuario: data.rol_usuario,
          id_empresa: data.id_empresa,
          primer_ingreso: data.primer_ingreso ?? true,
          activo: data.activo ?? true,
        },
      });

      if (this.usuarioConsumeLicencia(data.rol_usuario) && data.id_empresa && contratoActivo) {
        await tx.contrato.update({
          where: { id_contrato: contratoActivo.id_contrato },
          data: { licencias_usadas: { increment: 1 } },
        });
      }

      if (data.id_empresa) {
        const count = await tx.usuario.count({
          where: {
            id_empresa: data.id_empresa,
            activo: true,
            rol_usuario: {
              in: [RolUsuario.EMPLEADO, RolUsuario.COORDINADOR],
            },
          },
        });
        await tx.empresa.update({
          where: { id_empresa: data.id_empresa },
          data: { num_empl_empresa: count.toString() },
        });
      }

      return user;
    });

    const { cont_usuario, ...userWithoutPassword } = result;
    return userWithoutPassword;
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nom_usuario: true,
        ap_usuario: true,
        tel_usuario: true,
        email_usuario: true,
        username: true,
        rol_usuario: true,
        id_empresa: true,
        primer_ingreso: true,
        activo: true,
        created_at: true,
        empresa: true,
      },
      orderBy: { id_usuario: 'asc' },
    });
  }

  async findAllByEmpresa(idEmpresa: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id_empresa: idEmpresa },
    });

    if (!empresa) {
      throw new NotFoundException('La empresa no existe');
    }

    return this.prisma.usuario.findMany({
      where: {
        id_empresa: idEmpresa,
        rol_usuario: {
          in: [RolUsuario.EMPLEADO, RolUsuario.COORDINADOR],
        },
      },
      select: {
        id_usuario: true,
        nom_usuario: true,
        ap_usuario: true,
        tel_usuario: true,
        email_usuario: true,
        username: true,
        rol_usuario: true,
        id_empresa: true,
        primer_ingreso: true,
        activo: true,
        created_at: true,
        empresa: true,
      },
      orderBy: { id_usuario: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nom_usuario: true,
        ap_usuario: true,
        tel_usuario: true,
        email_usuario: true,
        username: true,
        rol_usuario: true,
        id_empresa: true,
        primer_ingreso: true,
        activo: true,
        created_at: true,
        empresa: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByUsername(username: string) {
    return this.prisma.usuario.findUnique({
      where: { username },
    });
  }

  async getLicenciasByEmpresa(idEmpresa: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id_empresa: idEmpresa },
    });

    if (!empresa) {
      throw new NotFoundException('La empresa no existe');
    }

    const contrato = await this.getContratoActivo(idEmpresa);

    return {
      id_empresa: empresa.id_empresa,
      empresa: empresa.nom_empresa,
      id_contrato: contrato.id_contrato,
      nombre_contrato: contrato.nombre_contrato,
      estado_contrato: this.calcularEstadoContrato(contrato),
      total_licencias: contrato.total_licencias,
      licencias_usadas: contrato.licencias_usadas,
      licencias_disponibles: contrato.total_licencias - contrato.licencias_usadas,
      total_cuestionarios: contrato.total_cuestionarios,
      cuestionarios_usados: contrato.cuestionarios_usados,
      cuestionarios_disponibles: contrato.total_cuestionarios - contrato.cuestionarios_usados,
      fecha_inicio: contrato.fecha_inicio,
      fecha_fin: contrato.fecha_fin,
    };
  }

  async update(id: number, data: UpdateUserDto, idEmpresa?: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (idEmpresa && user.id_empresa !== idEmpresa) {
      throw new BadRequestException('No tienes permiso para modificar este usuario');
    }

    if (data.email_usuario && data.email_usuario !== user.email_usuario) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email_usuario: data.email_usuario },
      });
      if (existingEmail) {
        throw new ConflictException('El correo ya está registrado por otro usuario');
      }
    }

    if (data.username && data.username !== user.username) {
      const existingUsername = await this.prisma.usuario.findUnique({
        where: { username: data.username },
      });
      if (existingUsername) {
        throw new ConflictException('El username ya está registrado por otro usuario');
      }
    }

    const updateData: any = {};

    if (data.nom_usuario !== undefined) updateData.nom_usuario = data.nom_usuario;
    if (data.ap_usuario !== undefined) updateData.ap_usuario = data.ap_usuario;
    if (data.tel_usuario !== undefined) updateData.tel_usuario = data.tel_usuario;
    if (data.email_usuario !== undefined) updateData.email_usuario = data.email_usuario;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.rol_usuario !== undefined) updateData.rol_usuario = data.rol_usuario;
    if (data.id_empresa !== undefined) updateData.id_empresa = data.id_empresa;
    if (data.primer_ingreso !== undefined) updateData.primer_ingreso = data.primer_ingreso;
    if (data.activo !== undefined) updateData.activo = data.activo;

    if (data.cont_usuario) {
      updateData.cont_usuario = await bcrypt.hash(data.cont_usuario, 10);
    }

    const oldConsumesLicencia = this.usuarioConsumeLicencia(user.rol_usuario);
    const newConsumesLicencia = data.rol_usuario
      ? this.usuarioConsumeLicencia(data.rol_usuario)
      : oldConsumesLicencia;
    const oldEmpresaId = user.id_empresa;
    const newEmpresaId = data.id_empresa !== undefined ? data.id_empresa : oldEmpresaId;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.usuario.update({
        where: { id_usuario: id },
        data: updateData,
        select: {
          id_usuario: true,
          nom_usuario: true,
          ap_usuario: true,
          tel_usuario: true,
          email_usuario: true,
          username: true,
          rol_usuario: true,
          id_empresa: true,
          primer_ingreso: true,
          activo: true,
          created_at: true,
          empresa: true,
        },
      });

      if (oldConsumesLicencia && !newConsumesLicencia && oldEmpresaId) {
        const contrato = await this.getContratoActivo(oldEmpresaId);
        if (contrato.licencias_usadas > 0) {
          await tx.contrato.update({
            where: { id_contrato: contrato.id_contrato },
            data: { licencias_usadas: { decrement: 1 } },
          });
        }
      } else if (!oldConsumesLicencia && newConsumesLicencia && newEmpresaId) {
        const contrato = await this.getContratoActivo(newEmpresaId);
        if (contrato.licencias_usadas >= contrato.total_licencias) {
          throw new BadRequestException('La empresa no tiene licencias disponibles');
        }
        await tx.contrato.update({
          where: { id_contrato: contrato.id_contrato },
          data: { licencias_usadas: { increment: 1 } },
        });
      } else if (newConsumesLicencia && oldEmpresaId !== newEmpresaId) {
        if (oldEmpresaId) {
          const contratoOld = await this.getContratoActivo(oldEmpresaId);
          if (contratoOld.licencias_usadas > 0) {
            await tx.contrato.update({
              where: { id_contrato: contratoOld.id_contrato },
              data: { licencias_usadas: { decrement: 1 } },
            });
          }
        }
        if (newEmpresaId) {
          const contratoNew = await this.getContratoActivo(newEmpresaId);
          if (contratoNew.licencias_usadas >= contratoNew.total_licencias) {
            throw new BadRequestException('La nueva empresa no tiene licencias disponibles');
          }
          await tx.contrato.update({
            where: { id_contrato: contratoNew.id_contrato },
            data: { licencias_usadas: { increment: 1 } },
          });
        }
      }

      if (oldEmpresaId) {
        const count = await tx.usuario.count({
          where: {
            id_empresa: oldEmpresaId,
            activo: true,
            rol_usuario: {
              in: [RolUsuario.EMPLEADO, RolUsuario.COORDINADOR],
            },
          },
        });
        await tx.empresa.update({
          where: { id_empresa: oldEmpresaId },
          data: { num_empl_empresa: count.toString() },
        });
      }

      if (newEmpresaId && newEmpresaId !== oldEmpresaId) {
        const count = await tx.usuario.count({
          where: {
            id_empresa: newEmpresaId,
            activo: true,
            rol_usuario: {
              in: [RolUsuario.EMPLEADO, RolUsuario.COORDINADOR],
            },
          },
        });
        await tx.empresa.update({
          where: { id_empresa: newEmpresaId },
          data: { num_empl_empresa: count.toString() },
        });
      }

      return updatedUser;
    });

    return result;
  }

  async remove(id: number, idEmpresa?: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (idEmpresa && user.id_empresa !== idEmpresa) {
      throw new BadRequestException('No tienes permiso para desactivar este usuario');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.usuario.update({
        where: { id_usuario: id },
        data: { activo: false },
        select: {
          id_usuario: true,
          nom_usuario: true,
          ap_usuario: true,
          email_usuario: true,
          username: true,
          rol_usuario: true,
          id_empresa: true,
          activo: true,
        },
      });

      if (
        user.activo &&
        this.usuarioConsumeLicencia(user.rol_usuario) &&
        user.id_empresa
      ) {
        const contrato = await this.getContratoActivo(user.id_empresa);
        if (contrato.licencias_usadas > 0) {
          await tx.contrato.update({
            where: { id_contrato: contrato.id_contrato },
            data: { licencias_usadas: { decrement: 1 } },
          });
        }
      }

      if (user.id_empresa) {
        const count = await tx.usuario.count({
          where: {
            id_empresa: user.id_empresa,
            activo: true,
            rol_usuario: {
              in: [RolUsuario.EMPLEADO, RolUsuario.COORDINADOR],
            },
          },
        });
        await tx.empresa.update({
          where: { id_empresa: user.id_empresa },
          data: { num_empl_empresa: count.toString() },
        });
      }

      return updatedUser;
    });

    return result;
  }
}