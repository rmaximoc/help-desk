import { api } from './api';
import { Technician, CreateTechnicianData } from '../types';

export const technicianService = {
  async create(data: CreateTechnicianData): Promise<Technician> {
    const response = await api.post<Technician>('/technicians', data);
    return response.data;
  },

  async findAll(): Promise<Technician[]> {
    const response = await api.get<Technician[]>('/technicians');
    return response.data;
  },

  async findById(id: string): Promise<Technician> {
    const response = await api.get<Technician>(`/technicians/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateTechnicianData>): Promise<Technician> {
    const response = await api.put<Technician>(`/technicians/${id}`, data);
    return response.data;
  },

  async updateProfile(data: { name?: string; availableHours?: string[] }): Promise<Technician> {
    const response = await api.patch<Technician>('/technicians/profile', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/technicians/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async findAvailable(): Promise<Pick<Technician, 'id' | 'name' | 'avatarUrl' | 'availableHours'>[]> {
    const response = await api.get('/technicians/available');
    return response.data;
  },
};
