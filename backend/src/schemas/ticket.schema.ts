import { z } from 'zod';
import { TicketStatus } from '@prisma/client';

// Schema para criação de chamado (pelo Cliente)
export const createTicketSchema = z.object({
  technicianId: z.string().uuid('ID do técnico inválido'),
  description: z.string().optional(),
  serviceIds: z.array(z.string().uuid('ID do serviço inválido'))
    .min(1, 'Selecione pelo menos um serviço'),
});

// Schema para atualização de status (pelo Admin ou Técnico)
export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus, {
    errorMap: () => ({ message: 'Status inválido. Use: OPEN, IN_PROGRESS ou CLOSED' }),
  }),
});

// Schema para adicionar serviço ao chamado (pelo Técnico)
export const addServiceToTicketSchema = z.object({
  serviceId: z.string().uuid('ID do serviço inválido'),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AddServiceToTicketInput = z.infer<typeof addServiceToTicketSchema>;
