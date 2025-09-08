import { useState, useEffect } from 'react';
import { supabaseSettingsService as settingsService } from '@/services/supabaseSettingsService';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { InitializationWizard } from '@/components/modals/InitializationWizard';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  Download,
  Upload,
  Lock,
  Globe,
  Mail,
  Key,
  Users,
  FileText,
  Save,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function Settings() {
  const [settings, setSettings] = useState({
    dealName: '',
    dealDescription: 'Insolvency proceeding data room',
    adminEmail: 'admin@test-company.de',
    companyLogo: '',
    primaryColor: '#1e40af',
    watermarkEnabled: true,
    downloadRestricted: true,
    sessionTimeout: '8',
    twoFactorRequired: true,
    emailNotifications: true,
    slackIntegration: false,
    auditLogging: true,
    documentRetention: '7',
    maxFileSize: '100',
    allowedFileTypes: '.pdf,.docx,.xlsx,.pptx',
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInitWizard, setShowInitWizard] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(prev => ({
          ...prev,
          dealName: data.dealName || 'Test GmbH - Asset Deal',
          watermarkEnabled: data.access?.watermarkEnabled ?? true,
          downloadRestricted: data.access?.downloadRestrictions ?? true,
          auditLogging: data.access?.auditLogging ?? true,
          emailNotifications: data.notifications?.emailAlerts ?? true,
        }));
      } catch (error) {
        console.error('Failed to load settings:', error);
        showErrorToast('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExportAllData = async () => {
    try {
      const toastId = showLoadingToast('Exporting data...');
      const backup = await settingsService.createBackup();
      
      // Create download link
      const link = document.createElement('a');
      link.href = backup.url;
      link.download = `vdr-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(toastId);
      showSuccessToast('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      showErrorToast('Failed to export data');
    }
  };

  const handleExportLogs = async () => {
    try {
      const toastId = showLoadingToast('Exporting logs...');
      // Mock export functionality
      const logs = await fetch('/api/audit-logs').catch(() => ({ json: () => [] }));
      const data = await logs.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast.dismiss(toastId);
      showSuccessToast('Logs exported successfully');
    } catch (error) {
      console.error('Failed to export logs:', error);
      showErrorToast('Failed to export logs');
    }
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          handleSettingChange('companyLogo', result);
          showSuccessToast('Logo uploaded successfully');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings? This will clear all data including documents, bids, timeline events, and users. This action cannot be undone.')) {
      try {
        const toastId = showLoadingToast('Resetting all data...');
        
        // Import supabase to clear all tables
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Clear all data tables
        await Promise.all([
          supabase.from('bids').delete().neq('id', ''),
          supabase.from('timeline_events').delete().neq('id', ''),
          supabase.from('qa_threads').delete().neq('id', ''),
          supabase.from('documents').delete().neq('id', ''),
          supabase.from('activity_logs').delete().neq('id', '')
        ]);
        
        // Reset to default values
        const defaultSettings = {
          dealName: 'Test GmbH - Asset Deal',
          dealDescription: 'Insolvency proceeding data room',
          adminEmail: 'admin@test-company.de',
          companyLogo: '',
          primaryColor: '#1e40af',
          watermarkEnabled: true,
          downloadRestricted: true,
          sessionTimeout: '8',
          twoFactorRequired: true,
          emailNotifications: true,
          slackIntegration: false,
          auditLogging: true,
          documentRetention: '7',
          maxFileSize: '100',
          allowedFileTypes: '.pdf,.docx,.xlsx,.pptx',
        };
        
        setSettings(defaultSettings);
        await handleSaveSettings();
        
        toast.dismiss(toastId);
        showSuccessToast('All data reset successfully');
        
        // Show initialization wizard
        setShowInitWizard(true);
      } catch (error) {
        console.error('Failed to reset settings:', error);
        showErrorToast('Failed to reset settings');
      }
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const toastId = showLoadingToast('Saving settings...');
      
      // Apply branding changes to document root
      if (settings.companyLogo) {
        document.documentElement.style.setProperty('--company-logo', `url(${settings.companyLogo})`);
      }
      if (settings.primaryColor) {
        // Convert hex to HSL for design system
        const hsl = hexToHsl(settings.primaryColor);
        document.documentElement.style.setProperty('--primary', hsl);
      }
      
      await settingsService.updateSettings({
        dealName: settings.dealName,
        dealType: 'Asset Deal',
        phase: 'NBO',
        timeline: '6 weeks',
        nboDeadline: '2024-02-01',
        finalBidDeadline: '2024-03-01',
        closingExpected: '2024-04-15',
        access: {
          watermarkEnabled: settings.watermarkEnabled,
          downloadRestrictions: settings.downloadRestricted,
          auditLogging: settings.auditLogging
        },
        notifications: {
          emailAlerts: settings.emailNotifications,
          qaNotifications: true,
          bidNotifications: true
        }
      });

      toast.dismiss(toastId);
      showSuccessToast('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showErrorToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage data room configuration, security, and preferences
              </p>
            </div>
            <Button className="gap-2" onClick={handleSaveSettings} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Deal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dealName">Deal Name</Label>
                  <Input
                    id="dealName"
                    value={settings.dealName}
                    onChange={(e) => handleSettingChange('dealName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealDescription">Description</Label>
                  <Textarea
                    id="dealDescription"
                    value={settings.dealDescription}
                    onChange={(e) => handleSettingChange('dealDescription', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Administrator Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.allowedFileTypes}
                    onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                    placeholder=".pdf,.docx,.xlsx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentRetention">Document Retention (years)</Label>
                  <Select 
                    value={settings.documentRetention}
                    onValueChange={(value) => handleSettingChange('documentRetention', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                      <SelectItem value="7">7 Years</SelectItem>
                      <SelectItem value="10">10 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorRequired}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorRequired', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Select 
                    value={settings.sessionTimeout}
                    onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="4">4 Hours</SelectItem>
                      <SelectItem value="8">8 Hours</SelectItem>
                      <SelectItem value="24">24 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Document Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Watermarking</Label>
                    <p className="text-sm text-muted-foreground">
                      Apply watermarks to all documents
                    </p>
                  </div>
                  <Switch
                    checked={settings.watermarkEnabled}
                    onCheckedChange={(checked) => handleSettingChange('watermarkEnabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Download Restrictions</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict document downloads
                    </p>
                  </div>
                  <Switch
                    checked={settings.downloadRestricted}
                    onCheckedChange={(checked) => handleSettingChange('downloadRestricted', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Track all user activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.auditLogging}
                    onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Slack Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack
                    </p>
                  </div>
                  <Switch
                    checked={settings.slackIntegration}
                    onCheckedChange={(checked) => handleSettingChange('slackIntegration', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('Email template editor - Coming soon!')}>
                  <FileText className="h-4 w-4" />
                  Invitation Email Template
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('Email template editor - Coming soon!')}>
                  <FileText className="h-4 w-4" />
                  Q&A Notification Template
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('Email template editor - Coming soon!')}>
                  <FileText className="h-4 w-4" />
                  Bid Deadline Reminder Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Brand Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyLogo">Company Logo</Label>
                      <div className="flex gap-3">
                        <Input
                          id="companyLogo"
                          value={settings.companyLogo ? 'Logo uploaded' : ''}
                          placeholder="Upload logo..."
                          readOnly
                        />
                        <Button variant="outline" className="gap-2" onClick={handleLogoUpload}>
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                      {settings.companyLogo && (
                        <div className="mt-2">
                          <img 
                            src={settings.companyLogo} 
                            alt="Company Logo Preview" 
                            className="h-16 w-auto border rounded"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                          placeholder="#1e40af"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Live Preview</Label>
                    <Card className="p-4 border-2" style={{ borderColor: settings.primaryColor }}>
                      <div className="space-y-3">
                        {settings.companyLogo && (
                          <img 
                            src={settings.companyLogo} 
                            alt="Logo" 
                            className="h-8 w-auto"
                          />
                        )}
                        <div 
                          className="h-8 rounded flex items-center px-3 text-white text-sm font-medium"
                          style={{ backgroundColor: settings.primaryColor }}
                        >
                          Primary Button
                        </div>
                        <div className="text-sm text-muted-foreground">
                          This is how your branding will appear throughout the portal
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-accent/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                    <div>
                      <h3 className="font-semibold">{settings.dealName}</h3>
                      <p className="text-sm text-muted-foreground">{settings.dealDescription}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    style={{ backgroundColor: settings.primaryColor }}
                    className="text-white"
                  >
                    Sample Button
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Data Export & Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExportAllData}>
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExportLogs}>
                  <Download className="h-4 w-4" />
                  Export Audit Logs
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExportLogs}>
                  <Download className="h-4 w-4" />
                  Export User Activity Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API & Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Access</Label>
                  <div className="flex gap-3">
                    <Input
                      value="sk-..."
                      readOnly
                      type="password"
                    />
                    <Button variant="outline" onClick={() => alert('API regeneration - Coming soon!')}>
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://your-app.com/webhook"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="destructive" className="w-full" onClick={handleResetSettings}>
                  Reset All Settings
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => {
                  if (window.confirm('Are you sure you want to delete the entire data room? This action cannot be undone and will remove ALL data.')) {
                    alert('Data room deletion - Contact administrator');
                  }
                }}>
                  Delete Data Room
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </>
      )}

      {/* Initialization Wizard */}
      <InitializationWizard
        isOpen={showInitWizard}
        onClose={() => setShowInitWizard(false)}
        onComplete={() => {
          // Reload page after wizard completion
          window.location.reload();
        }}
      />
    </div>
  );
}