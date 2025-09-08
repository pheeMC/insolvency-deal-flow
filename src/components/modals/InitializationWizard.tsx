import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wand2,
  Building2,
  Calendar,
  Users,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { supabaseSettingsService } from '@/services/supabaseSettingsService';
import { supabaseTimelineService } from '@/services/supabaseTimelineService';
import { documentsService } from '@/services/supabaseDocumentsService';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';

interface InitializationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface WizardData {
  // Step 1: Deal Info
  dealName: string;
  dealType: string;
  phase: string;
  description: string;
  
  // Step 2: Timeline
  nboDeadline: string;
  finalBidDeadline: string;
  closingExpected: string;
  
  // Step 3: Initial Setup
  createSampleFolders: boolean;
  createSampleTimeline: boolean;
}

export function InitializationWizard({ isOpen, onClose, onComplete }: InitializationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WizardData>({
    dealName: '',
    dealType: 'Asset Deal',
    phase: 'NBO',
    description: '',
    nboDeadline: '',
    finalBidDeadline: '',
    closingExpected: '',
    createSampleFolders: true,
    createSampleTimeline: true,
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!data.dealName) {
      showErrorToast('Please enter a deal name');
      return;
    }

    setLoading(true);
    try {
      const toastId = showLoadingToast('Initializing data room...');

      // Step 1: Save deal settings
      await supabaseSettingsService.updateSettings({
        dealName: data.dealName,
        dealType: data.dealType,
        phase: data.phase,
        timeline: '6 weeks',
        nboDeadline: data.nboDeadline,
        finalBidDeadline: data.finalBidDeadline,
        closingExpected: data.closingExpected,
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
      });

      // Step 2: Create sample folders if requested
      if (data.createSampleFolders) {
        const folders = [
          { name: '00_Admin', description: 'Administrative documents' },
          { name: '01_Corporate', description: 'Corporate structure and governance' },
          { name: '02_Financials', description: 'Financial statements and reports' },
          { name: '03_Legal', description: 'Legal documents and contracts' },
          { name: '04_Operations', description: 'Operational information' },
          { name: '90_InsO', description: 'Insolvency proceedings' },
        ];

        for (const folder of folders) {
          await documentsService.createFolder(folder.name, undefined, 'full');
        }
      }

      // Step 3: Create sample timeline if requested
      if (data.createSampleTimeline) {
        const timelineEvents = [
          {
            title: 'NDA Execution',
            description: 'Non-disclosure agreements signed by all parties',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks ago
            time: '09:00',
            type: 'milestone' as const,
            status: 'completed' as const,
            participants: ['All Bidders']
          },
          {
            title: 'Data Room Opening',
            description: 'Virtual data room opened for due diligence',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
            time: '10:00',
            type: 'milestone' as const,
            status: 'completed' as const,
            participants: ['All Bidders']
          },
          {
            title: 'Initial Offer (IOI) Deadline',
            description: 'Deadline for submission of initial offers',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
            time: '17:00',
            type: 'milestone' as const,
            status: 'completed' as const,
            participants: ['Strategic Bidders', 'Financial Bidders']
          },
          {
            title: 'Non-Binding Offer (NBO) Deadline',
            description: 'Deadline for submission of non-binding offers',
            date: data.nboDeadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
            time: '17:00',
            type: 'milestone' as const,
            status: 'ongoing' as const,
            participants: ['Selected Bidders']
          },
          {
            title: 'Binding Offer Deadline',
            description: 'Final binding offers due',
            date: data.finalBidDeadline || new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 weeks from now
            time: '17:00',
            type: 'milestone' as const,
            status: 'upcoming' as const,
            participants: ['Finalist Bidders']
          },
          {
            title: 'Expected Closing',
            description: 'Anticipated transaction closing date',
            date: data.closingExpected || new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 weeks from now
            time: '12:00',
            type: 'milestone' as const,
            status: 'upcoming' as const,
            participants: ['Winning Bidder']
          }
        ];

        for (const event of timelineEvents) {
          await supabaseTimelineService.createEvent(event);
        }
      }

      toast.dismiss(toastId);
      showSuccessToast('Data room initialized successfully!');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to initialize data room:', error);
      showErrorToast('Failed to initialize data room');
    } finally {
      setLoading(false);
    }
  };

  const updateData = (field: keyof WizardData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Deal Information</h3>
              <p className="text-sm text-muted-foreground">Set up your new data room with basic deal information</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dealName">Deal Name *</Label>
                <Input
                  id="dealName"
                  placeholder="e.g., ABC Company - Asset Acquisition"
                  value={data.dealName}
                  onChange={(e) => updateData('dealName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dealType">Deal Type</Label>
                <Select value={data.dealType} onValueChange={(value) => updateData('dealType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asset Deal">Asset Deal</SelectItem>
                    <SelectItem value="Share Deal">Share Deal</SelectItem>
                    <SelectItem value="Merger">Merger</SelectItem>
                    <SelectItem value="Acquisition">Acquisition</SelectItem>
                    <SelectItem value="Insolvency">Insolvency Proceeding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phase">Current Phase</Label>
                <Select value={data.phase} onValueChange={(value) => updateData('phase', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IOI">Initial Offer (IOI)</SelectItem>
                    <SelectItem value="NBO">Non-Binding Offer (NBO)</SelectItem>
                    <SelectItem value="Binding Offer">Binding Offer</SelectItem>
                    <SelectItem value="Due Diligence">Due Diligence</SelectItem>
                    <SelectItem value="Closing">Closing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the transaction"
                  value={data.description}
                  onChange={(e) => updateData('description', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Timeline Setup</h3>
              <p className="text-sm text-muted-foreground">Define key dates for your transaction</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nboDeadline">Non-Binding Offer Deadline</Label>
                <Input
                  id="nboDeadline"
                  type="date"
                  value={data.nboDeadline}
                  onChange={(e) => updateData('nboDeadline', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="finalBidDeadline">Final Bid Deadline</Label>
                <Input
                  id="finalBidDeadline"
                  type="date"
                  value={data.finalBidDeadline}
                  onChange={(e) => updateData('finalBidDeadline', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closingExpected">Expected Closing Date</Label>
                <Input
                  id="closingExpected"
                  type="date"
                  value={data.closingExpected}
                  onChange={(e) => updateData('closingExpected', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Initial Setup</h3>
              <p className="text-sm text-muted-foreground">Choose what to set up automatically</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Create Sample Folders</p>
                  <p className="text-sm text-muted-foreground">
                    Set up standard document folders (Admin, Corporate, Financials, etc.)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={data.createSampleFolders}
                  onChange={(e) => updateData('createSampleFolders', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Create Sample Timeline</p>
                  <p className="text-sm text-muted-foreground">
                    Set up a typical M&A timeline with key milestones
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={data.createSampleTimeline}
                  onChange={(e) => updateData('createSampleTimeline', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Check className="h-12 w-12 mx-auto text-success mb-4" />
              <h3 className="text-lg font-semibold">Ready to Initialize</h3>
              <p className="text-sm text-muted-foreground">Review your settings and create your new data room</p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Deal Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{data.dealName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{data.dealType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase:</span>
                    <Badge variant="secondary">{data.phase}</Badge>
                  </div>
                  {data.nboDeadline && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NBO Deadline:</span>
                      <span>{new Date(data.nboDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="text-xs text-muted-foreground">
                {data.createSampleFolders && "✓ Sample folders will be created"}<br />
                {data.createSampleTimeline && "✓ Sample timeline will be created"}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Data Room Initialization Wizard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
          
          <Separator />
          
          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={loading}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading || !data.dealName}>
                  {loading ? 'Initializing...' : 'Initialize Data Room'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}