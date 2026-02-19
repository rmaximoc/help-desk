import { Request, Response } from 'express';
import { technicianService } from '../services/technician.service.js';
import {
  CreateTechnicianInput,
  UpdateTechnicianInput,
  UpdateTechnicianProfileInput,
} from '../schemas/technician.schema.js';

export class TechnicianController {
  // Admin: criar técnico
  async create(req: Request<{}, {}, CreateTechnicianInput>, res: Response) {
    const result = await technicianService.create(req.body);
    res.status(201).json(result);
  }

  // Admin: listar todos os técnicos
  async findAll(_req: Request, res: Response) {
    const result = await technicianService.findAll();
    res.json(result);
  }

  // Admin: buscar técnico por ID
  async findById(req: Request<{ id: string }>, res: Response) {
    const result = await technicianService.findById(req.params.id);
    res.json(result);
  }

  // Admin: atualizar técnico
  async update(req: Request<{ id: string }, {}, UpdateTechnicianInput>, res: Response) {
    const result = await technicianService.update(req.params.id, req.body);
    res.json(result);
  }

  // Técnico: atualizar próprio perfil
  async updateProfile(req: Request<{}, {}, UpdateTechnicianProfileInput>, res: Response) {
    const { userId } = req.user!;
    const result = await technicianService.updateProfile(userId, req.body);
    res.json(result);
  }

  // Técnico: upload de avatar
  async uploadAvatar(req: Request, res: Response) {
    const { userId } = req.user!;

    if (!req.file) {
      res.status(400).json({ message: 'Nenhum arquivo enviado' });
      return;
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const result = await technicianService.updateAvatar(userId, avatarUrl);
    res.json(result);
  }

  // Público: listar técnicos disponíveis (para seleção no chamado)
  async findAvailable(_req: Request, res: Response) {
    const result = await technicianService.findAvailable();
    res.json(result);
  }
}

export const technicianController = new TechnicianController();
