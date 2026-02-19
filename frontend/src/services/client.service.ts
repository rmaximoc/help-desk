import { api } from './api';
import { Client, CreateClientData } from '../types';

export const clientService = {
  async register(data: CreateClientData): Promise<Client> {
    const response = await api.post<Client>('/clients/register', data);
    return response.data;
  },

  async findAll(): Promise<Client[]> {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },

  async findById(id: string): Promise<Client> {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  async updateByAdmin(id: string, data: { name?: string; email?: string }): Promise<Client> {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  async deleteByAdmin(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<Client> {
    const response = await api.patch<Client>('/clients/profile', data);
    return response.data;
  },

  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete('/clients/account');
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/clients/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
