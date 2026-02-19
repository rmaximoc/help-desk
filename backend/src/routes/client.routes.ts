import { Router } from 'express';
import { clientController } from '../controllers/client.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminOnly, clientOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../config/upload.js';
import {
  createClientSchema,
  updateClientSchema,
  updateClientByAdminSchema,
} from '../schemas/client.schema.js';

const router = Router();

// Rota pública: registro de cliente
router.post('/register', validate(createClientSchema), (req, res, next) => {
  clientController.register(req, res).catch(next);
});

// Rotas autenticadas
router.use(authMiddleware);

// Rotas do Admin
router.get('/', adminOnly, (req, res, next) => {
  clientController.findAll(req, res).catch(next);
});

router.get('/:id', adminOnly, (req, res, next) => {
  clientController.findById(req, res).catch(next);
});

router.put('/:id', adminOnly, validate(updateClientByAdminSchema), (req, res, next) => {
  clientController.updateByAdmin(req, res).catch(next);
});

router.delete('/:id', adminOnly, (req, res, next) => {
  clientController.deleteByAdmin(req, res).catch(next);
});

// Rotas do Cliente
router.patch('/profile', clientOnly, validate(updateClientSchema), (req, res, next) => {
  clientController.updateProfile(req, res).catch(next);
});

router.delete('/account', clientOnly, (req, res, next) => {
  clientController.deleteAccount(req, res).catch(next);
});

router.post('/avatar', clientOnly, upload.single('avatar'), (req, res, next) => {
  clientController.uploadAvatar(req, res).catch(next);
});

export { router as clientRoutes };
