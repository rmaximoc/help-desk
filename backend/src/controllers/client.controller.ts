import { Request, Response } from 'express';
import { clientService } from '../services/client.service.js';
import {
  CreateClientInput,
  UpdateClientInput,
  UpdateClientByAdminInput,
} from '../schemas/client.schema.js';

export class ClientController {
  // Público: registro de cliente
  async register(req: Request<object, object,CreateClientInput>, res: Response) {
    const result = await clientService.create(req.body);
    res.status(201).json(result);
  }

  // Admin: listar todos os clientes
  async findAll(_req: Request, res: Response) {
    const result = await clientService.findAll();
    res.json(result);
  }

  // Admin: buscar cliente por ID
  async findById(req: Request<{ id: string }>, res: Response) {
    const result = await clientService.findById(req.params.id);
    res.json(result);
  }

  // Admin: atualizar cliente
  async updateByAdmin(req: Request<{ id: string }, object, UpdateClientByAdminInput>, res: Response) {
    const result = await clientService.updateByAdmin(req.params.id, req.body);
    res.json(result);
  }

  // Admin: excluir cliente
  async deleteByAdmin(req: Request<{ id: string }>, res: Response) {
    const result = await clientService.delete(req.params.id);
    res.json(result);
  }

  // Cliente: atualizar próprio perfil
  async updateProfile(req: Request<object, object,UpdateClientInput>, res: Response) {
    const { userId } = req.user!;
    const result = await clientService.update(userId, req.body);
    res.json(result);
  }

  // Cliente: excluir própria conta
  async deleteAccount(req: Request, res: Response) {
    const { userId } = req.user!;
    const result = await clientService.deleteByUserId(userId);
    res.json(result);
  }

  // Cliente: upload de avatar
  async uploadAvatar(req: Request, res: Response) {
    const { userId } = req.user!;

    if (!req.file) {
      res.status(400).json({ message: 'Nenhum arquivo enviado' });
      return;
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const result = await clientService.updateAvatar(userId, avatarUrl);
    res.json(result);
  }
}

export const clientController = new ClientController();
