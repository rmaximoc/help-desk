import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminOnly, technicianOnly, clientOnly, adminOrTechnician } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  addServiceToTicketSchema,
} from '../schemas/ticket.schema.js';

const router = Router();

// Todas as rotas são autenticadas
router.use(authMiddleware);

// Admin: listar todos os chamados
router.get('/', adminOnly, (req, res, next) => {
  ticketController.findAll(req, res).catch(next);
});

// Cliente: criar chamado
router.post('/', clientOnly, validate(createTicketSchema), (req, res, next) => {
  ticketController.create(req, res).catch(next);
});

// Cliente: listar seus chamados
router.get('/my-tickets', clientOnly, (req, res, next) => {
  ticketController.findMyTickets(req, res).catch(next);
});

// Técnico: listar chamados atribuídos
router.get('/assigned', technicianOnly, (req, res, next) => {
  ticketController.findAssignedTickets(req, res).catch(next);
});

// Admin/Técnico/Cliente: buscar chamado por ID
router.get('/:id', (req, res, next) => {
  ticketController.findById(req, res).catch(next);
});

// Admin/Técnico: atualizar status
router.patch('/:id/status', adminOrTechnician, validate(updateTicketStatusSchema), (req, res, next) => {
  ticketController.updateStatus(req, res).catch(next);
});

// Técnico: adicionar serviço ao chamado
router.post('/:id/services', technicianOnly, validate(addServiceToTicketSchema), (req, res, next) => {
  ticketController.addService(req, res).catch(next);
});

export { router as ticketRoutes };
