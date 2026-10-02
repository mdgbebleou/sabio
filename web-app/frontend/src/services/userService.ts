import { api } from './api';

// 
export interface UserDTO {
  id: string | number;
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: 'Admin' | 'Teacher' | 'Accountant' | 'Parent';
  status?: 'Active' | 'Suspended' | 'Pending';
  custom_id?: string;
  last_active?: string;
  is_active?: boolean;
}

export const userService = {
  getUsers: async (): Promise<UserDTO[]> => {
    try {
      const response = await api.get('/api/users/list/');
      const data = response.data;
      
      const rawList: UserDTO[] = Array.isArray(data) 
        ? data 
        : Array.isArray(data.results) 
        ? data.results 
        : Array.isArray(data.users) 
        ? data.users 
        : [];

      return rawList.map((user) => ({
        ...user,
        id: String(user.id || ''),
        custom_id: user.custom_id || `USR-${user.id || '0'}`,
        role: user.role || 'Admin',
        status: user.status || (user.is_active === false ? 'Suspended' : 'Active'),
      }));
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData: Partial<UserDTO>) => {
    const response = await api.post('/api/users/provision/', userData);
    return response.data;
  },

  resetPassword: async (userId: string) => {
    const response = await api.post(`/api/users/${userId}/reset-password/`);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/api/users/${userId}/`);
    return response.data;
  }
};