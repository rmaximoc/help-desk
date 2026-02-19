import { z } from 'zod';

// Schema para criação de cliente (auto-registro)
export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

// Schema para atualização de cliente
export const updateClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('E-mail inválido').optional(),
});

// Schema para atualização de cliente pelo Admin
export const updateClientByAdminSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('E-mail inválido').optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type UpdateClientByAdminInput = z.infer<typeof updateClientByAdminSchema>;
