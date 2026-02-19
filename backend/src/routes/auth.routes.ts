import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, changePasswordSchema } from '../schemas/auth.schema.js';

const router = Router();

// Login
router.post('/login', validate(loginSchema), (req, res, next) => {
  authController.login(req, res).catch(next);
});

// Rotas autenticadas
router.use(authMiddleware);

// Obter perfil
router.get('/profile', (req, res, next) => {
  authController.getProfile(req, res).catch(next);
});

// Alterar senha
router.patch('/change-password', validate(changePasswordSchema), (req, res, next) => {
  authController.changePassword(req, res).catch(next);
});

export { router as authRoutes };
