import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class InterventionTypesService {
  constructor(private prisma: PrismaService) {}

  async list(params: { search?: string; doctorId?: string }) {
    const { search, doctorId } = params;

    const where: any = { isActive: true };
    if (search && search.trim() !== '') {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    // Inclure la nomenclature globale (createdByDoctorId = null) + les types du médecin si fourni
    if (doctorId) {
      where.OR = [{ createdByDoctorId: null }, { createdByDoctorId: doctorId }];
    } else {
      where.createdByDoctorId = null;
    }

    return this.prisma.interventionType.findMany({
      where,
      orderBy: [{ createdByDoctorId: 'asc' }, { name: 'asc' }],
    });
  }

  async create(params: { name: string; doctorId?: string }) {
    const name = (params.name || '').trim();
    if (!name) {
      throw new BadRequestException('Le nom du type d’intervention est obligatoire');
    }

    // Optionnel: éviter les doublons (même nom) pour ce médecin et global
    const existing = await this.prisma.interventionType.findFirst({
      where: {
        isActive: true,
        name: { equals: name, mode: 'insensitive' },
        OR: [{ createdByDoctorId: null }, { createdByDoctorId: params.doctorId || null }],
      },
    });
    if (existing) return existing;

    return this.prisma.interventionType.create({
      data: {
        name,
        createdByDoctorId: params.doctorId || null,
        isActive: true,
      },
    });
  }
}

