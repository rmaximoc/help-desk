import { z } from 'zod';

// Schema para criação de serviço
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('O preço deve ser maior que zero'),
});

// Schema para atualização de serviço
export const updateServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  description: z.string().optional(),
  price: z.number().positive('O preço deve ser maior que zero').optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
