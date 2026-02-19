import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import {
  CreateClientInput,
  UpdateClientInput,
  UpdateClientByAdminInput,
} from '../schemas/client.schema.js';

export class ClientService {
  async create(data: CreateClientInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Já existe um usuário com este e-mail');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: Role.CLIENT,
          isFirstAccess: false,
        },
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
        },
      });

      return { user, client };
    });

    return {
      id: result.client.id,
      userId: result.user.id,
      name: result.user.name,
      email: result.user.email,
      createdAt: result.user.createdAt,
    };
  }

  async findAll() {
    const clients = await prisma.client.findMany({
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
        _count: {
          select: { tickets: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return clients.map((client) => ({
      id: client.id,
      userId: client.user.id,
      name: client.user.name,
      email: client.user.email,
      avatarUrl: client.user.avatarUrl,
      ticketsCount: client._count.tickets,
      createdAt: client.user.createdAt,
    }));
  }

  async findById(id: string) {
    const client = await prisma.client.findUnique({
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
        tickets: {
          include: {
            technician: {
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

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return {
      id: client.id,
      userId: client.user.id,
      name: client.user.name,
      email: client.user.email,
      avatarUrl: client.user.avatarUrl,
      createdAt: client.user.createdAt,
      tickets: client.tickets,
    };
  }

  async findByUserId(userId: string) {
    const client = await prisma.client.findUnique({
      where: { userId },
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

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return client;
  }

  async update(userId: string, data: UpdateClientInput) {
    const client = await prisma.client.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    if (data.email && data.email !== client.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('Já existe um usuário com este e-mail');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return updatedUser;
  }

  async updateByAdmin(id: string, data: UpdateClientByAdminInput) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    if (data.email && data.email !== client.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('Já existe um usuário com este e-mail');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: client.userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return {
      clientId: client.id,
      ...updatedUser,
    };
  }

  async delete(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    // Deleta o usuário (cascade deleta o client e tickets)
    await prisma.user.delete({
      where: { id: client.userId },
    });

    return { message: 'Cliente excluído com sucesso' };
  }

  async deleteByUserId(userId: string) {
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Conta excluída com sucesso' };
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
}

export const clientService = new ClientService();
