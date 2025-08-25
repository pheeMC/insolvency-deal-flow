import { apiClient } from './api';
import { ApiResponse, PaginatedResponse, User, UserFilter } from '../types/api';
import { mockUsers } from './mockData';

export const usersService = {
  // GET /users
  async getUsers(filter?: UserFilter, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredUsers = [...mockUsers];
    
    // Apply filters
    if (filter?.role && filter.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filter.role);
    }
    
    if (filter?.status && filter.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === filter.status);
    }
    
    if (filter?.organization && filter.organization !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.organization === filter.organization);
    }
    
    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.organization.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      }
    };
  },

  // GET /users/:id
  async getUser(id: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  // POST /users/invite
  async inviteUser(email: string, role: User['role'], organization: string, accessLevel: string[]): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role,
      organization,
      status: 'pending',
      joinedAt: new Date().toISOString(),
      accessLevel
    };
    
    mockUsers.push(newUser);
    return newUser;
  },

  // PUT /users/:id
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  },

  // PUT /users/:id/status
  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], status };
    return mockUsers[userIndex];
  },

  // PUT /users/:id/role
  async updateUserRole(id: string, role: User['role'], accessLevel: string[]): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], role, accessLevel };
    return mockUsers[userIndex];
  },

  // DELETE /users/:id
  async deleteUser(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
    }
  },

  // GET /users/:id/activity
  async getUserActivity(id: string): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return [
      {
        id: '1',
        action: 'Login',
        timestamp: user.lastLogin || new Date().toISOString(),
        details: 'Successful login from IP 192.168.1.100'
      },
      {
        id: '2',
        action: 'Document Access',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'Accessed Financial Statements Q3 2024.pdf'
      },
      {
        id: '3',
        action: 'Q&A Submission',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: 'Submitted question about employee contracts'
      }
    ];
  },

  // POST /users/:id/message
  async sendMessage(id: string, subject: string, message: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log(`Message sent to ${user.email}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    // In a real implementation, this would send an email
  },

  // GET /users/roles
  async getRoles(): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      'owner',
      'insolvency-admin',
      'ma-advisor',
      'deal-admin',
      'bidder-lead',
      'bidder-member',
      'clean-team',
      'viewer'
    ];
  },

  // GET /users/organizations
  async getOrganizations(): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const organizations = [...new Set(mockUsers.map(user => user.organization))];
    return organizations;
  },
};