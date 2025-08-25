import { apiClient } from './api';
import { ApiResponse, DealSettings } from '../types/api';
import { mockDealSettings } from './mockData';

export const settingsService = {
  // GET /settings
  async getSettings(): Promise<DealSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return { ...mockDealSettings };
  },

  // PUT /settings
  async updateSettings(settings: Partial<DealSettings>): Promise<DealSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    Object.assign(mockDealSettings, settings);
    return { ...mockDealSettings };
  },

  // PUT /settings/deal
  async updateDealSettings(dealSettings: Partial<DealSettings>): Promise<DealSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    Object.assign(mockDealSettings, dealSettings);
    return { ...mockDealSettings };
  },

  // PUT /settings/access
  async updateAccessSettings(accessSettings: DealSettings['access']): Promise<DealSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockDealSettings.access = { ...mockDealSettings.access, ...accessSettings };
    return { ...mockDealSettings };
  },

  // PUT /settings/notifications
  async updateNotificationSettings(notificationSettings: DealSettings['notifications']): Promise<DealSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockDealSettings.notifications = { ...mockDealSettings.notifications, ...notificationSettings };
    return { ...mockDealSettings };
  },

  // POST /settings/backup
  async createBackup(): Promise<{ url: string }> {
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const backupUrl = `/backups/vdr-backup-${Date.now()}.zip`;
    return { url: backupUrl };
  },

  // POST /settings/restore
  async restoreBackup(file: File): Promise<void> {
    // Simulate backup restoration
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`Backup restored from file: ${file.name}`);
    // In a real implementation, this would restore the system state
  },
};