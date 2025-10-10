import { api } from './client'
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth'

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/register', credentials)
    return data
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', credentials)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout')
  },

  me: async (): Promise<{ user: User }> => {
    const { data } = await api.get<{ user: User }>('/api/auth/me')
    return data
  },
}
