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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderPlus, Folder } from 'lucide-react';

interface FolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: (folder: Document) => void;
  parentId?: string;
  folder?: Document | null;
}

export function FolderModal({
  open,
  onOpenChange,
  onFolderCreated,
  parentId,
  folder,
}: FolderModalProps) {
  const [name, setName] = useState(folder?.name || '');
  const [access, setAccess] = useState<Document['access']>(folder?.access || 'full');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setCreating(true);
    try {
      const toastId = showLoadingToast(folder ? 'Updating folder...' : 'Creating folder...');
      
      let newFolder: Document;
      if (folder) {
        newFolder = await documentsService.updateDocument(folder.id, { name, access });
      } else {
        newFolder = await documentsService.createFolder(name, parentId, access);
      }

      toast.dismiss(toastId);
      showSuccessToast(folder ? 'Folder updated successfully' : 'Folder created successfully');
      onFolderCreated(newFolder);
      onOpenChange(false);
      
      // Reset form
      setName('');
      setAccess('full');
    } catch (error) {
      console.error('Failed to save folder:', error);
      showErrorToast('Failed to save folder');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {folder ? 'Edit Folder' : 'New Folder'}
          </DialogTitle>
          <DialogDescription>
            {folder ? 'Update the folder details.' : 'Create a new folder to organize documents.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim() || creating}
          >
            {creating ? (folder ? 'Updating...' : 'Creating...') : (folder ? 'Update Folder' : 'Create Folder')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}