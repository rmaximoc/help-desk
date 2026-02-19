export type Role = 'ADMIN' | 'TECHNICIAN' | 'CLIENT';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  isFirstAccess: boolean;
  createdAt: string;
}

export interface Technician {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  availableHours: string[];
  isFirstAccess?: boolean;
  temporaryPassword?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  ticketsCount?: number;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export interface TicketService {
  id: string;
  name: string;
  price: number;
  addedByTechnician: boolean;
}

export interface Ticket {
  id: string;
  status: TicketStatus;
  description: string | null;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  technician?: {
    id: string;
    name: string;
  };
  services: TicketService[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateTechnicianData {
  name: string;
  email: string;
  availableHours?: string[];
}

export interface CreateClientData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
}

export interface CreateTicketData {
  technicianId: string;
  description?: string;
  serviceIds: string[];
}

export interface UpdateTicketStatusData {
  status: TicketStatus;
}

export interface AddServiceToTicketData {
  serviceId: string;
}
