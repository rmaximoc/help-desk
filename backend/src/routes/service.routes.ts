import { Router } from 'express';
import { serviceController } from '../controllers/service.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createServiceSchema, updateServiceSchema } from '../schemas/service.schema.js';

const router = Router();

// Rota pública: listar serviços ativos
router.get('/', (req, res, next) => {
  serviceController.findAll(req, res).catch(next);
});

// Rotas autenticadas (Admin)
router.use(authMiddleware);
router.use(adminOnly);

// Listar todos os serviços (incluindo inativos)
router.get('/all', (req, res, next) => {
  serviceController.findAllAdmin(req, res).catch(next);
});

// Criar serviço
router.post('/', validate(createServiceSchema), (req, res, next) => {
  serviceController.create(req, res).catch(next);
});

// Buscar serviço por ID
router.get('/:id', (req, res, next) => {
  serviceController.findById(req, res).catch(next);
});

// Atualizar serviço
router.put('/:id', validate(updateServiceSchema), (req, res, next) => {
  serviceController.update(req, res).catch(next);
});

// Desativar serviço
router.patch('/:id/deactivate', (req, res, next) => {
  serviceController.deactivate(req, res).catch(next);
});

// Reativar serviço
router.patch('/:id/activate', (req, res, next) => {
  serviceController.activate(req, res).catch(next);
});

export { router as serviceRoutes };
