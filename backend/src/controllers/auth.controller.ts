import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { LoginInput, ChangePasswordInput } from '../schemas/auth.schema.js';

export class AuthController {
  async login(req: Request<object, object,LoginInput>, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  }

  async changePassword(req: Request<object, object,ChangePasswordInput>, res: Response) {
    const { userId } = req.user!;
    const result = await authService.changePassword(userId, req.body);
    res.json(result);
  }

  async getProfile(req: Request, res: Response) {
    const { userId } = req.user!;
    const result = await authService.getProfile(userId);
    res.json(result);
  }
}

export const authController = new AuthController();
