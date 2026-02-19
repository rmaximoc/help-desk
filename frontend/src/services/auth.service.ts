import { api } from './api';
import { AuthResponse, LoginCredentials, ChangePasswordData, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.patch('/auth/change-password', data);
    return response.data;
  },
};
