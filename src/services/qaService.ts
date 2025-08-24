import { apiClient } from './api';
import { ApiResponse, PaginatedResponse, QAThread, QAFilter } from '../types/api';

export const qaService = {
  // GET /qa/threads
  async getThreads(filter?: QAFilter, page = 1, limit = 20): Promise<PaginatedResponse<QAThread>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.category && { category: filter.category }),
      ...(filter?.priority && { priority: filter.priority }),
      ...(filter?.search && { search: filter.search }),
    });

    return await apiClient.get<PaginatedResponse<QAThread>>(`/qa/threads?${params}`);
  },

  // GET /qa/threads/:id
  async getThread(id: string): Promise<QAThread> {
    const response = await apiClient.get<ApiResponse<QAThread>>(`/qa/threads/${id}`);
    return response.data;
  },

  // POST /qa/threads
  async createThread(thread: Omit<QAThread, 'id' | 'askedAt' | 'status'>): Promise<QAThread> {
    const response = await apiClient.post<ApiResponse<QAThread>>('/qa/threads', thread);
    return response.data;
  },

  // PUT /qa/threads/:id
  async updateThread(id: string, updates: Partial<QAThread>): Promise<QAThread> {
    const response = await apiClient.put<ApiResponse<QAThread>>(`/qa/threads/${id}`, updates);
    return response.data;
  },

  // POST /qa/threads/:id/answer
  async answerThread(id: string, answer: string, publishTo: 'all-bidders' | 'specific-bidder' | 'draft' = 'draft'): Promise<QAThread> {
    const response = await apiClient.post<ApiResponse<QAThread>>(`/qa/threads/${id}/answer`, {
      answer,
      publishTo,
    });
    return response.data;
  },

  // PUT /qa/threads/:id/status
  async updateStatus(id: string, status: QAThread['status']): Promise<QAThread> {
    const response = await apiClient.put<ApiResponse<QAThread>>(`/qa/threads/${id}/status`, { status });
    return response.data;
  },

  // POST /qa/threads/:id/notes
  async addInternalNote(id: string, note: string): Promise<void> {
    await apiClient.post(`/qa/threads/${id}/notes`, { note });
  },

  // GET /qa/categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/qa/categories');
    return response.data;
  },

  // DELETE /qa/threads/:id
  async deleteThread(id: string): Promise<void> {
    await apiClient.delete(`/qa/threads/${id}`);
  },
};