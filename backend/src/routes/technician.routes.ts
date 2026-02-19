import { Router } from 'express';
import { technicianController } from '../controllers/technician.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminOnly, technicianOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../config/upload.js';
import {
  createTechnicianSchema,
  updateTechnicianSchema,
  updateTechnicianProfileSchema,
} from '../schemas/technician.schema.js';

const router = Router();

// Rota pública: listar técnicos disponíveis
router.get('/available', (req, res, next) => {
  technicianController.findAvailable(req, res).catch(next);
});

// Rotas autenticadas
router.use(authMiddleware);

// Rotas do Admin
router.post('/', adminOnly, validate(createTechnicianSchema), (req, res, next) => {
  technicianController.create(req, res).catch(next);
});

router.get('/', adminOnly, (req, res, next) => {
  technicianController.findAll(req, res).catch(next);
});

router.get('/:id', adminOnly, (req, res, next) => {
  technicianController.findById(req, res).catch(next);
});

router.put('/:id', adminOnly, validate(updateTechnicianSchema), (req, res, next) => {
  technicianController.update(req, res).catch(next);
});

// Rotas do Técnico
router.patch('/profile', technicianOnly, validate(updateTechnicianProfileSchema), (req, res, next) => {
  technicianController.updateProfile(req, res).catch(next);
});

router.post('/avatar', technicianOnly, upload.single('avatar'), (req, res, next) => {
  technicianController.uploadAvatar(req, res).catch(next);
});

export { router as technicianRoutes };
