import { apiClient } from './api';
import { ApiResponse, PaginatedResponse, Bid } from '../types/api';

export const bidsService = {
  // GET /bids
  async getBids(phase?: string, status?: string): Promise<Bid[]> {
    const params = new URLSearchParams({
      ...(phase && { phase }),
      ...(status && { status }),
    });

    const response = await apiClient.get<ApiResponse<Bid[]>>(`/bids?${params}`);
    return response.data;
  },

  // GET /bids/:id
  async getBid(id: string): Promise<Bid> {
    const response = await apiClient.get<ApiResponse<Bid>>(`/bids/${id}`);
    return response.data;
  },

  // POST /bids
  async createBid(bid: Omit<Bid, 'id' | 'submittedAt' | 'status'>): Promise<Bid> {
    const response = await apiClient.post<ApiResponse<Bid>>('/bids', bid);
    return response.data;
  },

  // PUT /bids/:id
  async updateBid(id: string, updates: Partial<Bid>): Promise<Bid> {
    const response = await apiClient.put<ApiResponse<Bid>>(`/bids/${id}`, updates);
    return response.data;
  },

  // PUT /bids/:id/status
  async updateBidStatus(id: string, status: Bid['status']): Promise<Bid> {
    const response = await apiClient.put<ApiResponse<Bid>>(`/bids/${id}/status`, { status });
    return response.data;
  },

  // DELETE /bids/:id
  async deleteBid(id: string): Promise<void> {
    await apiClient.delete(`/bids/${id}`);
  },

  // POST /bids/:id/attachments
  async uploadAttachment(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.uploadFile<ApiResponse<{ url: string }>>(`/bids/${id}/attachments`, formData);
    return response.data.url;
  },

  // GET /bids/export
  async exportBids(format = 'excel'): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/bids/export?format=${format}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.blob();
  },
};