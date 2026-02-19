import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export function roleMiddleware(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Você não tem permissão para acessar este recurso');
    }

    next();
  };
}

// Middleware específico para Admin
export const adminOnly = roleMiddleware(Role.ADMIN);

// Middleware para Admin e Técnico
export const adminOrTechnician = roleMiddleware(Role.ADMIN, Role.TECHNICIAN);

// Middleware para Técnico apenas
export const technicianOnly = roleMiddleware(Role.TECHNICIAN);

// Middleware para Cliente apenas
export const clientOnly = roleMiddleware(Role.CLIENT);

// Middleware para todos os usuários autenticados
export const authenticated = roleMiddleware(Role.ADMIN, Role.TECHNICIAN, Role.CLIENT);
