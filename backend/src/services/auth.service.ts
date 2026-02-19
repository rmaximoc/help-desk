import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { JwtPayload } from '../types/index.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { LoginInput, ChangePasswordInput } from '../schemas/auth.schema.js';

export class AuthService {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isFirstAccess: user.isFirstAccess,
      },
      token,
    };
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const passwordMatch = await bcrypt.compare(data.currentPassword, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError('Senha atual incorreta');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isFirstAccess: false,
      },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isFirstAccess: true,
        createdAt: true,
        technician: {
          select: {
            id: true,
            availableHours: true,
          },
        },
        client: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }
}

export const authService = new AuthService();
