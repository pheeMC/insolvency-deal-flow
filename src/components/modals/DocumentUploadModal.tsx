import { useState } from 'react';
import { documentsService } from '@/services/supabaseDocumentsService';
import { Document } from '@/types/api';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileText } from 'lucide-react';

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string;
  onUploadComplete: (document: Document) => void;
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  folderId,
  onUploadComplete,
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [access, setAccess] = useState<Document['access']>('full');
  const [watermark, setWatermark] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const toastId = showLoadingToast('Uploading document...');
      
      const uploadedDocument = await documentsService.uploadDocument({
        file,
        name,
        access,
        watermark,
        folderId,
      });

      toast.dismiss(toastId);
      showSuccessToast('Document uploaded successfully');
      onUploadComplete(uploadedDocument);
      onOpenChange(false);
      
      // Reset form
      setFile(null);
      setName('');
      setAccess('full');
      setWatermark(true);
    } catch (error) {
      console.error('Upload failed:', error);
      showErrorToast('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload a new document to the data room with appropriate access controls.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              {file && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access">Access Level</Label>
            <Select value={access} onValueChange={(value: Document['access']) => setAccess(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Access</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="clean-team">Clean Team Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="watermark">Apply Watermark</Label>
              <p className="text-sm text-muted-foreground">
                Add security watermark to document
              </p>
            </div>
            <Switch
              id="watermark"
              checked={watermark}
              onCheckedChange={setWatermark}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || !name.trim() || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}