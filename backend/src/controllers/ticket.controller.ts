import { Request, Response } from 'express';
import { ticketService } from '../services/ticket.service.js';
import {
  CreateTicketInput,
  UpdateTicketStatusInput,
  AddServiceToTicketInput,
} from '../schemas/ticket.schema.js';

export class TicketController {
  // Cliente: criar chamado
  async create(req: Request<object, object,CreateTicketInput>, res: Response) {
    const { userId } = req.user!;
    const result = await ticketService.create(userId, req.body);
    res.status(201).json(result);
  }

  // Admin: listar todos os chamados
  async findAll(_req: Request, res: Response) {
    const result = await ticketService.findAll();
    res.json(result);
  }

  // Admin/Técnico/Cliente: buscar chamado por ID
  async findById(req: Request<{ id: string }>, res: Response) {
    const result = await ticketService.findById(req.params.id);
    res.json(result);
  }

  // Cliente: listar seus chamados
  async findMyTickets(req: Request, res: Response) {
    const { userId } = req.user!;
    const result = await ticketService.findByClientUserId(userId);
    res.json(result);
  }

  // Técnico: listar chamados atribuídos
  async findAssignedTickets(req: Request, res: Response) {
    const { userId } = req.user!;
    const result = await ticketService.findByTechnicianUserId(userId);
    res.json(result);
  }

  // Admin/Técnico: atualizar status do chamado
  async updateStatus(req: Request<{ id: string }, object, UpdateTicketStatusInput>, res: Response) {
    const { userId, role } = req.user!;
    const isAdmin = role === 'ADMIN';
    const result = await ticketService.updateStatus(req.params.id, req.body, userId, isAdmin);
    res.json(result);
  }

  // Técnico: adicionar serviço ao chamado
  async addService(req: Request<{ id: string }, object, AddServiceToTicketInput>, res: Response) {
    const { userId } = req.user!;
    const result = await ticketService.addService(req.params.id, req.body, userId);
    res.json(result);
  }
}

export const ticketController = new TicketController();
