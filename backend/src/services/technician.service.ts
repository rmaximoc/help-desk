import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { generateTemporaryPassword, DEFAULT_AVAILABLE_HOURS } from '../utils/helpers.js';
import {
  CreateTechnicianInput,
  UpdateTechnicianInput,
  UpdateTechnicianProfileInput,
} from '../schemas/technician.schema.js';

export class TechnicianService {
  async create(data: CreateTechnicianInput) {
    // Verifica se já existe usuário com este email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Já existe um usuário com este e-mail');
    }

    // Gera senha provisória
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Cria usuário e técnico em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: Role.TECHNICIAN,
          isFirstAccess: true,
        },
      });

      const technician = await tx.technician.create({
        data: {
          userId: user.id,
          availableHours: data.availableHours || DEFAULT_AVAILABLE_HOURS,
        },
      });

      return { user, technician };
    });

    return {
      id: result.technician.id,
      userId: result.user.id,
      name: result.user.name,
      email: result.user.email,
      temporaryPassword, // Retornado apenas na criação
      availableHours: result.technician.availableHours,
      createdAt: result.user.createdAt,
    };
  }

  async findAll() {
    const technicians = await prisma.technician.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isFirstAccess: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return technicians.map((tech) => ({
      id: tech.id,
      userId: tech.user.id,
      name: tech.user.name,
      email: tech.user.email,
      avatarUrl: tech.user.avatarUrl,
      isFirstAccess: tech.user.isFirstAccess,
      availableHours: tech.availableHours,
      createdAt: tech.user.createdAt,
    }));
  }

  async findById(id: string) {
    const technician = await prisma.technician.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isFirstAccess: true,
            createdAt: true,
          },
        },
        tickets: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            ticketServices: {
              include: {
                service: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!technician) {
      throw new NotFoundError('Técnico não encontrado');
    }

    return {
      id: technician.id,
      userId: technician.user.id,
      name: technician.user.name,
      email: technician.user.email,
      avatarUrl: technician.user.avatarUrl,
      isFirstAccess: technician.user.isFirstAccess,
      availableHours: technician.availableHours,
      createdAt: technician.user.createdAt,
      tickets: technician.tickets,
    };
  }

  async findByUserId(userId: string) {
    const technician = await prisma.technician.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isFirstAccess: true,
            createdAt: true,
          },
        },
      },
    });

    if (!technician) {
      throw new NotFoundError('Técnico não encontrado');
    }

    return technician;
  }

  async update(id: string, data: UpdateTechnicianInput) {
    const technician = await prisma.technician.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!technician) {
      throw new NotFoundError('Técnico não encontrado');
    }

    // Verifica se o novo email já existe
    if (data.email && data.email !== technician.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('Já existe um usuário com este e-mail');
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.name || data.email) {
        await tx.user.update({
          where: { id: technician.userId },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email }),
          },
        });
      }

      if (data.availableHours) {
        await tx.technician.update({
          where: { id },
          data: { availableHours: data.availableHours },
        });
      }

      return tx.technician.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
        },
      });
    });

    return result;
  }

  async updateProfile(userId: string, data: UpdateTechnicianProfileInput) {
    const technician = await prisma.technician.findUnique({
      where: { userId },
    });

    if (!technician) {
      throw new NotFoundError('Técnico não encontrado');
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: data.name },
        });
      }

      if (data.availableHours) {
        await tx.technician.update({
          where: { id: technician.id },
          data: { availableHours: data.availableHours },
        });
      }

      return tx.technician.findUnique({
        where: { id: technician.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
        },
      });
    });

    return result;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  async findAvailable() {
    const technicians = await prisma.technician.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return technicians.map((tech) => ({
      id: tech.id,
      name: tech.user.name,
      avatarUrl: tech.user.avatarUrl,
      availableHours: tech.availableHours,
    }));
  }
}

export const technicianService = new TechnicianService();
