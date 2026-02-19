import { Request, Response } from 'express';
import { serviceService } from '../services/service.service.js';
import { CreateServiceInput, UpdateServiceInput } from '../schemas/service.schema.js';

export class ServiceController {
  // Admin: criar serviço
  async create(req: Request<{}, {}, CreateServiceInput>, res: Response) {
    const result = await serviceService.create(req.body);
    res.status(201).json(result);
  }

  // Admin: listar todos os serviços (incluindo inativos)
  async findAllAdmin(_req: Request, res: Response) {
    const result = await serviceService.findAll(true);
    res.json(result);
  }

  // Público/Cliente: listar serviços ativos
  async findAll(_req: Request, res: Response) {
    const result = await serviceService.findAll(false);
    res.json(result);
  }

  // Admin: buscar serviço por ID
  async findById(req: Request<{ id: string }>, res: Response) {
    const result = await serviceService.findById(req.params.id);
    res.json(result);
  }

  // Admin: atualizar serviço
  async update(req: Request<{ id: string }, {}, UpdateServiceInput>, res: Response) {
    const result = await serviceService.update(req.params.id, req.body);
    res.json(result);
  }

  // Admin: desativar serviço (soft delete)
  async deactivate(req: Request<{ id: string }>, res: Response) {
    const result = await serviceService.deactivate(req.params.id);
    res.json(result);
  }

  // Admin: reativar serviço
  async activate(req: Request<{ id: string }>, res: Response) {
    const result = await serviceService.activate(req.params.id);
    res.json(result);
  }
}

export const serviceController = new ServiceController();
