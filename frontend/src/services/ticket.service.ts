import { api } from './api';
import { Ticket, CreateTicketData, UpdateTicketStatusData, AddServiceToTicketData } from '../types';

export const ticketService = {
  async create(data: CreateTicketData): Promise<Ticket> {
    const response = await api.post<Ticket>('/tickets', data);
    return response.data;
  },

  async findAll(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets');
    return response.data;
  },

  async findById(id: string): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  async findMyTickets(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets/my-tickets');
    return response.data;
  },

  async findAssigned(): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>('/tickets/assigned');
    return response.data;
  },

  async updateStatus(id: string, data: UpdateTicketStatusData): Promise<Ticket> {
    const response = await api.patch<Ticket>(`/tickets/${id}/status`, data);
    return response.data;
  },

  async addService(id: string, data: AddServiceToTicketData): Promise<Ticket> {
    const response = await api.post<Ticket>(`/tickets/${id}/services`, data);
    return response.data;
  },
};
