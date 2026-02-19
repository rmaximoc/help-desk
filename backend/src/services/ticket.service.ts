import { TicketStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../config/database.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import {
  CreateTicketInput,
  UpdateTicketStatusInput,
  AddServiceToTicketInput,
} from '../schemas/ticket.schema.js';

export class TicketService {
  async create(clientUserId: string, data: CreateTicketInput) {
    // Busca o client associado ao userId
    const client = await prisma.client.findUnique({
      where: { userId: clientUserId },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    // Verifica se o técnico existe
    const technician = await prisma.technician.findUnique({
      where: { id: data.technicianId },
    });

    if (!technician) {
      throw new NotFoundError('Técnico não encontrado');
    }

    // Busca os serviços e seus preços
    const services = await prisma.service.findMany({
      where: {
        id: { in: data.serviceIds },
        isActive: true,
      },
    });

    if (services.length !== data.serviceIds.length) {
      throw new NotFoundError('Um ou mais serviços não foram encontrados ou estão inativos');
    }

    // Cria o ticket com os serviços
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          clientId: client.id,
          technicianId: data.technicianId,
          description: data.description,
          status: TicketStatus.OPEN,
        },
      });

      // Adiciona os serviços ao ticket
      await tx.ticketService.createMany({
        data: services.map((service) => ({
          ticketId: newTicket.id,
          serviceId: service.id,
          price: service.price,
          addedByTechnician: false,
        })),
      });

      return tx.ticket.findUnique({
        where: { id: newTicket.id },
        include: {
          client: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          technician: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
          ticketServices: {
            include: {
              service: true,
            },
          },
        },
      });
    });

    return this.formatTicketResponse(ticket!);
  }

  async findAll() {
    const tickets = await prisma.ticket.findMany({
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { name: true },
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
    });

    return tickets.map((ticket) => this.formatTicketResponse(ticket));
  }

  async findById(id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        ticketServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    return this.formatTicketResponse(ticket);
  }

  async findByClientUserId(clientUserId: string) {
    const client = await prisma.client.findUnique({
      where: { userId: clientUserId },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const tickets = await prisma.ticket.findMany({
      where: { clientId: client.id },
      include: {
        technician: {
          include: {
            user: {
              select: { name: true },
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
    });

    return tickets.map((ticket) => this.formatTicketResponse(ticket));
  }

  async findByTechnicianUserId(technicianUserId: string) {
    const technician = await prisma.technician.findUnique({
      where: { userId: technicianUserId },
    });

    if (!technician) {
      throw new NotFoundError('Técnico não encontrado');
    }

    const tickets = await prisma.ticket.findMany({
      where: { technicianId: technician.id },
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true },
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
    });

    return tickets.map((ticket) => this.formatTicketResponse(ticket));
  }

  async updateStatus(id: string, data: UpdateTicketStatusInput, userId: string, isAdmin: boolean) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        technician: true,
      },
    });

    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    // Verifica se o técnico pode atualizar este chamado
    if (!isAdmin && ticket.technician.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para alterar este chamado');
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: data.status },
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        ticketServices: {
          include: {
            service: true,
          },
        },
      },
    });

    return this.formatTicketResponse(updatedTicket);
  }

  async addService(ticketId: string, data: AddServiceToTicketInput, technicianUserId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        technician: true,
      },
    });

    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    // Verifica se o técnico é o responsável pelo chamado
    if (ticket.technician.userId !== technicianUserId) {
      throw new ForbiddenError('Você não tem permissão para adicionar serviços a este chamado');
    }

    // Verifica se o chamado está aberto ou em atendimento
    if (ticket.status === TicketStatus.CLOSED) {
      throw new ForbiddenError('Não é possível adicionar serviços a um chamado encerrado');
    }

    // Verifica se o serviço existe e está ativo
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service || !service.isActive) {
      throw new NotFoundError('Serviço não encontrado ou está inativo');
    }

    // Verifica se o serviço já foi adicionado ao chamado
    const existingTicketService = await prisma.ticketService.findUnique({
      where: {
        ticketId_serviceId: {
          ticketId,
          serviceId: data.serviceId,
        },
      },
    });

    if (existingTicketService) {
      throw new ConflictError('Este serviço já foi adicionado ao chamado');
    }

    // Adiciona o serviço ao chamado
    await prisma.ticketService.create({
      data: {
        ticketId,
        serviceId: data.serviceId,
        price: service.price,
        addedByTechnician: true,
      },
    });

    // Retorna o ticket atualizado
    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        technician: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        ticketServices: {
          include: {
            service: true,
          },
        },
      },
    });

    return this.formatTicketResponse(updatedTicket!);
  }

  private formatTicketResponse(ticket: any) {
    const services = ticket.ticketServices.map((ts: any) => ({
      id: ts.service.id,
      name: ts.service.name,
      price: Number(ts.price),
      addedByTechnician: ts.addedByTechnician,
    }));

    const totalPrice = ticket.ticketServices.reduce(
      (sum: number, ts: any) => sum + Number(ts.price),
      0
    );

    return {
      id: ticket.id,
      status: ticket.status,
      description: ticket.description,
      client: ticket.client
        ? {
            id: ticket.client.id,
            name: ticket.client.user.name,
            email: ticket.client.user.email,
          }
        : undefined,
      technician: ticket.technician
        ? {
            id: ticket.technician.id,
            name: ticket.technician.user.name,
          }
        : undefined,
      services,
      totalPrice,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}

export const ticketService = new TicketService();
