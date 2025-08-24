import { apiClient } from './api';
import { ApiResponse, PaginatedResponse, User, UserFilter } from '../types/api';

export const usersService = {
  // GET /users
  async getUsers(filter?: UserFilter, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter?.role && { role: filter.role }),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.organization && { organization: filter.organization }),
      ...(filter?.search && { search: filter.search }),
    });

    return await apiClient.get<PaginatedResponse<User>>(`/users?${params}`);
  },

  // GET /users/:id
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // POST /users/invite
  async inviteUser(email: string, role: User['role'], organization: string, accessLevel: string[]): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users/invite', {
      email,
      role,
      organization,
      accessLevel,
    });
    return response.data;
  },

  // PUT /users/:id
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, updates);
    return response.data;
  },

  // PUT /users/:id/status
  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}/status`, { status });
    return response.data;
  },

  // PUT /users/:id/role
  async updateUserRole(id: string, role: User['role'], accessLevel: string[]): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}/role`, { role, accessLevel });
    return response.data;
  },

  // DELETE /users/:id
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // GET /users/:id/activity
  async getUserActivity(id: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/users/${id}/activity`);
    return response.data;
  },

  // POST /users/:id/message
  async sendMessage(id: string, subject: string, message: string): Promise<void> {
    await apiClient.post(`/users/${id}/message`, { subject, message });
  },

  // GET /users/roles
  async getRoles(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/users/roles');
    return response.data;
  },

  // GET /users/organizations
  async getOrganizations(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/users/organizations');
    return response.data;
  },
};