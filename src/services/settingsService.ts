import { apiClient } from './api';
import { ApiResponse, DealSettings } from '../types/api';

export const settingsService = {
  // GET /settings
  async getSettings(): Promise<DealSettings> {
    const response = await apiClient.get<ApiResponse<DealSettings>>('/settings');
    return response.data;
  },

  // PUT /settings
  async updateSettings(settings: Partial<DealSettings>): Promise<DealSettings> {
    const response = await apiClient.put<ApiResponse<DealSettings>>('/settings', settings);
    return response.data;
  },

  // PUT /settings/deal
  async updateDealSettings(dealSettings: Partial<DealSettings>): Promise<DealSettings> {
    const response = await apiClient.put<ApiResponse<DealSettings>>('/settings/deal', dealSettings);
    return response.data;
  },

  // PUT /settings/access
  async updateAccessSettings(accessSettings: DealSettings['access']): Promise<DealSettings> {
    const response = await apiClient.put<ApiResponse<DealSettings>>('/settings/access', accessSettings);
    return response.data;
  },

  // PUT /settings/notifications
  async updateNotificationSettings(notificationSettings: DealSettings['notifications']): Promise<DealSettings> {
    const response = await apiClient.put<ApiResponse<DealSettings>>('/settings/notifications', notificationSettings);
    return response.data;
  },

  // POST /settings/backup
  async createBackup(): Promise<{ url: string }> {
    const response = await apiClient.post<ApiResponse<{ url: string }>>('/settings/backup');
    return response.data;
  },

  // POST /settings/restore
  async restoreBackup(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('backup', file);

    await apiClient.uploadFile('/settings/restore', formData);
  },
};