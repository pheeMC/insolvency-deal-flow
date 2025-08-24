import { apiClient } from './api';
import { ApiResponse, DashboardStats, RecentActivity, DealMetrics } from '../types/api';

export const dashboardService = {
  // GET /dashboard/stats
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  // GET /dashboard/recent-activity
  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await apiClient.get<ApiResponse<RecentActivity[]>>('/dashboard/recent-activity');
    return response.data;
  },

  // GET /dashboard/deal-metrics
  async getDealMetrics(): Promise<DealMetrics> {
    const response = await apiClient.get<ApiResponse<DealMetrics>>('/dashboard/deal-metrics');
    return response.data;
  },

  // GET /dashboard/export/activity-report
  async exportActivityReport(): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/dashboard/export/activity-report`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.blob();
  },

  // GET /dashboard/access-logs
  async getAccessLogs(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/dashboard/access-logs');
    return response.data;
  },
};