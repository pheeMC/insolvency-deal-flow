import { apiClient } from './api';
import { ApiResponse, TimelineEvent } from '../types/api';

export const timelineService = {
  // GET /timeline/events
  async getEvents(startDate?: string, endDate?: string): Promise<TimelineEvent[]> {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await apiClient.get<ApiResponse<TimelineEvent[]>>(`/timeline/events?${params}`);
    return response.data;
  },

  // GET /timeline/events/:id
  async getEvent(id: string): Promise<TimelineEvent> {
    const response = await apiClient.get<ApiResponse<TimelineEvent>>(`/timeline/events/${id}`);
    return response.data;
  },

  // POST /timeline/events
  async createEvent(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const response = await apiClient.post<ApiResponse<TimelineEvent>>('/timeline/events', event);
    return response.data;
  },

  // PUT /timeline/events/:id
  async updateEvent(id: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const response = await apiClient.put<ApiResponse<TimelineEvent>>(`/timeline/events/${id}`, updates);
    return response.data;
  },

  // DELETE /timeline/events/:id
  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/timeline/events/${id}`);
  },

  // GET /timeline/milestones
  async getMilestones(): Promise<TimelineEvent[]> {
    const response = await apiClient.get<ApiResponse<TimelineEvent[]>>('/timeline/milestones');
    return response.data;
  },
};