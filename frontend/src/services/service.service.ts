import { api } from './api';
import { Service, CreateServiceData } from '../types';

export const serviceService = {
  async create(data: CreateServiceData): Promise<Service> {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  async findAll(): Promise<Service[]> {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },

  async findAllAdmin(): Promise<Service[]> {
    const response = await api.get<Service[]>('/services/all');
    return response.data;
  },

  async findById(id: string): Promise<Service> {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateServiceData & { isActive?: boolean }>): Promise<Service> {
    const response = await api.put<Service>(`/services/${id}`, data);
    return response.data;
  },

  async deactivate(id: string): Promise<Service> {
    const response = await api.patch<Service>(`/services/${id}/deactivate`);
    return response.data;
  },

  async activate(id: string): Promise<Service> {
    const response = await api.patch<Service>(`/services/${id}/activate`);
    return response.data;
  },
};
