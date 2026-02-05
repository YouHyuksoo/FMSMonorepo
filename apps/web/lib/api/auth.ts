/**
 * @file apps/web/lib/api/auth.ts
 * @description 인증 API
 */

import { apiClient, tokenStorage } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationId: string;
  employeeNumber?: string;
  phone?: string;
  position?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  employeeNumber?: string;
  phone?: string;
  position?: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    code: string;
  };
  roles: { role: { name: string } }[];
  isActive: boolean;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    // 토큰 저장
    tokenStorage.set(response.data.accessToken);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    tokenStorage.set(response.data.accessToken);
    return response.data;
  },

  logout: (): void => {
    tokenStorage.remove();
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!tokenStorage.get();
  },
};
