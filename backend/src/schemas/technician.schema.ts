import { z } from 'zod';

// Schema para criação de técnico (pelo Admin)
export const createTechnicianSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  availableHours: z.array(z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'))
    .optional(),
});

// Schema para atualização de técnico (pelo Admin)
export const updateTechnicianSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('E-mail inválido').optional(),
  availableHours: z.array(z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'))
    .optional(),
});

// Schema para atualização do próprio perfil (pelo Técnico)
export const updateTechnicianProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  availableHours: z.array(z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'))
    .optional(),
});

export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
export type UpdateTechnicianInput = z.infer<typeof updateTechnicianSchema>;
export type UpdateTechnicianProfileInput = z.infer<typeof updateTechnicianProfileSchema>;
