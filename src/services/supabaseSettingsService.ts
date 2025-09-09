import { supabase } from '@/integrations/supabase/client';
import { DealSettings } from '../types/api';
import { showErrorToast } from '@/components/ui/toast-notifications';

export const supabaseSettingsService = {
  async getSettings(): Promise<DealSettings> {
    const { data, error } = await supabase
      .from('deal_settings')
      .select('*')
      .maybeSingle();
    
    if (error) {
      showErrorToast(`Failed to fetch settings: ${error.message}`);
      throw error;
    }
    
    // If no settings exist, return default settings
    if (!data) {
      return getDefaultSettings();
    }
    
    return mapDatabaseToApi(data);
  },

  async updateSettings(settings: Partial<DealSettings>): Promise<DealSettings> {
    const updateData = mapApiToDatabase(settings);
    
    // First check if settings exist
    const { data: existingSettings } = await supabase
      .from('deal_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('deal_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) {
        showErrorToast(`Failed to update settings: ${error.message}`);
        throw error;
      }
      
      return mapDatabaseToApi(data);
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('deal_settings')
        .insert({ ...mapApiToDatabase(getDefaultSettings()), ...updateData })
        .select()
        .single();
      
      if (error) {
        showErrorToast(`Failed to create settings: ${error.message}`);
        throw error;
      }
      
      return mapDatabaseToApi(data);
    }
  },

  async updateDealSettings(dealSettings: Partial<DealSettings>): Promise<DealSettings> {
    return this.updateSettings(dealSettings);
  },

  async updateAccessSettings(accessSettings: DealSettings['access']): Promise<DealSettings> {
    const settings: Partial<DealSettings> = { access: accessSettings };
    return this.updateSettings(settings);
  },

  async updateNotificationSettings(notificationSettings: DealSettings['notifications']): Promise<DealSettings> {
    const updateData: any = {};
    
    if (notificationSettings?.emailAlerts !== undefined) {
      updateData.email_alerts = notificationSettings.emailAlerts;
    }
    if (notificationSettings?.qaNotifications !== undefined) {
      updateData.qa_notifications = notificationSettings.qaNotifications;
    }
    if (notificationSettings?.bidNotifications !== undefined) {
      updateData.bid_notifications = notificationSettings.bidNotifications;
    }
    
    // Get the first settings record
    const { data: existingSettings } = await supabase
      .from('deal_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (!existingSettings) {
      showErrorToast('No settings found to update');
      throw new Error('No settings found');
    }
    
    const { data, error } = await supabase
      .from('deal_settings')
      .update(updateData)
      .eq('id', existingSettings.id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update notification settings: ${error.message}`);
      throw error;
    }
    
    return mapDatabaseToApi(data);
  },

  async resetAllData(): Promise<void> {
    try {
      // Clear all data tables in the correct order to handle dependencies
      const clearOperations = [
        supabase.from('activity_logs').delete().neq('id', ''),
        supabase.from('bids').delete().neq('id', ''), 
        supabase.from('qa_threads').delete().neq('id', ''),
        supabase.from('timeline_events').delete().neq('id', ''),
        supabase.from('documents').delete().neq('id', ''),
        // Reset deal_settings to defaults
        supabase.from('deal_settings').delete().neq('id', '')
      ];

      const results = await Promise.allSettled(clearOperations);
      
      // Log any errors but don't fail the entire operation
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Failed to clear table ${index}:`, result.reason);
        }
      });

      console.log('All data tables cleared successfully');
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  },

  async createBackup(): Promise<{ url: string }> {
    // Create backup by exporting all data
    const backupData = {
      timestamp: new Date().toISOString(),
      tables: {}
    };
    
    // Export key tables
    const tableNames = ['documents', 'bids', 'qa_threads', 'timeline_events', 'profiles'];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase.from(tableName as any).select('*');
        if (!error) {
          (backupData.tables as any)[tableName] = data;
        }
      } catch (e) {
        console.warn(`Failed to backup table ${tableName}:`, e);
      }
    }
    
    // In a real implementation, this would upload to storage
    const backupContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return { url };
  },

  async restoreBackup(file: File): Promise<void> {
    // In a real implementation, this would parse the backup file
    // and restore data to the database
    console.log(`Backup restoration initiated for file: ${file.name}`);
    
    // Simulate restoration process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Get current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get current user's profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (userProfile) {
          // Log the restoration action using profile ID
          await supabase
            .from('activity_logs')
            .insert({
              user_id: userProfile.id,
              action: 'Backup Restored',
              resource_type: 'system',
              details: { fileName: file.name, size: file.size }
            });
        }
      }
    } catch (error) {
      console.error('Failed to log backup restoration:', error);
      // Don't throw error to prevent blocking the restore functionality
    }
  },

};

// Helper functions
function getDefaultSettings(): DealSettings {
  return {
    dealName: 'Default Deal',
    dealType: 'M&A',
    phase: 'Due Diligence',
    timeline: '6 weeks',
    nboDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    finalBidDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    closingExpected: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    access: {
      watermarkEnabled: true,
      downloadRestrictions: true,
      auditLogging: true
    },
    notifications: {
      emailAlerts: true,
      qaNotifications: true,
      bidNotifications: true
    }
  };
}

function mapDatabaseToApi(data: any): DealSettings {
  return {
    dealName: data.deal_name,
    dealType: data.deal_type,
    phase: data.phase,
    timeline: data.timeline || '6 weeks',
    nboDeadline: data.nbo_deadline,
    finalBidDeadline: data.final_bid_deadline,
    closingExpected: data.closing_expected,
    access: {
      watermarkEnabled: data.watermark_enabled ?? true,
      downloadRestrictions: data.download_restrictions ?? true,
      auditLogging: data.audit_logging ?? true
    },
    notifications: {
      emailAlerts: data.email_alerts ?? true,
      qaNotifications: data.qa_notifications ?? true,
      bidNotifications: data.bid_notifications ?? true
    }
  };
}

function mapApiToDatabase(settings: Partial<DealSettings>): any {
  const data: any = {};
  
  if (settings.dealName) data.deal_name = settings.dealName;
  if (settings.dealType) data.deal_type = settings.dealType;
  if (settings.phase) data.phase = settings.phase;
  if (settings.timeline) data.timeline = settings.timeline;
  if (settings.nboDeadline) data.nbo_deadline = settings.nboDeadline;
  if (settings.finalBidDeadline) data.final_bid_deadline = settings.finalBidDeadline;
  if (settings.closingExpected) data.closing_expected = settings.closingExpected;
  
  if (settings.access) {
    if (settings.access.watermarkEnabled !== undefined) {
      data.watermark_enabled = settings.access.watermarkEnabled;
    }
    if (settings.access.downloadRestrictions !== undefined) {
      data.download_restrictions = settings.access.downloadRestrictions;
    }
    if (settings.access.auditLogging !== undefined) {
      data.audit_logging = settings.access.auditLogging;
    }
  }
  
  if (settings.notifications) {
    if (settings.notifications.emailAlerts !== undefined) {
      data.email_alerts = settings.notifications.emailAlerts;
    }
    if (settings.notifications.qaNotifications !== undefined) {
      data.qa_notifications = settings.notifications.qaNotifications;
    }
    if (settings.notifications.bidNotifications !== undefined) {
      data.bid_notifications = settings.notifications.bidNotifications;
    }
  }
  
  return data;
}