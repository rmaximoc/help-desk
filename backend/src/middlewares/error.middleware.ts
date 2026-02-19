import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Erro de validação do Zod
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });

    res.status(422).json({
      status: 'error',
      message: 'Erro de validação',
      errors,
    });
    return;
  }

  // Erro customizado de validação
  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  // Erro customizado da aplicação
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
    return;
  }

  // Erro do Multer
  if (error.name === 'MulterError') {
    res.status(400).json({
      status: 'error',
      message: 'Erro no upload do arquivo',
    });
    return;
  }

  // Erro não tratado
  console.error('[ERROR]', error);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
};
