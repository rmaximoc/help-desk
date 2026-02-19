import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { CreateServiceInput, UpdateServiceInput } from '../schemas/service.schema.js';

export class ServiceService {
  async create(data: CreateServiceInput) {
    // Verifica se já existe um serviço com este nome
    const existingService = await prisma.service.findFirst({
      where: { name: data.name },
    });

    if (existingService) {
      throw new ConflictError('Já existe um serviço com este nome');
    }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
      },
    });

    return service;
  }

  async findAll(includeInactive = false) {
    const services = await prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: {
        name: 'asc',
      },
    });

    return services;
  }

  async findById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    return service;
  }

  async update(id: string, data: UpdateServiceInput) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    // Verifica se o novo nome já existe
    if (data.name && data.name !== service.name) {
      const existingService = await prisma.service.findFirst({
        where: { name: data.name },
      });

      if (existingService) {
        throw new ConflictError('Já existe um serviço com este nome');
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price && { price: data.price }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return updatedService;
  }

  async deactivate(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    return updatedService;
  }

  async activate(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive: true },
    });

    return updatedService;
  }
}

export const serviceService = new ServiceService();
