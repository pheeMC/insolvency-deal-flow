import { useState, useEffect } from 'react';
import { User } from '@/types/api';
import { supabaseUsersService as usersService } from '@/services/supabaseUsersService';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast-notifications';
import {
  Dialog,
  DialogContent,
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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserUpdated: (user: User) => void;
}

export const EditUserModal = ({ open, onOpenChange, user, onUserUpdated }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
    status: '',
    accessLevel: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        status: user.status,
        accessLevel: user.accessLevel,
      });
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedUser = await usersService.updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        status: formData.status as User['status'],
      });

      if (formData.role !== user.role) {
        await usersService.updateUserRole(user.id, formData.role as User['role'], formData.accessLevel);
      }

      onUserUpdated(updatedUser);
      showSuccessToast('User updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update user:', error);
      showErrorToast('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleAccessLevelChange = (level: string) => {
    setFormData(prev => ({
      ...prev,
      accessLevel: prev.accessLevel.includes(level)
        ? prev.accessLevel.filter(l => l !== level)
        : [...prev.accessLevel, level],
    }));
  };

  const accessLevels = [
    '00_Admin',
    '01_Corporate',
    '02_Financials',
    '90_InsO',
    'Q&A Access',
    'Bid Submission',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="insolvency-admin">Insolvency Admin</SelectItem>
                <SelectItem value="ma-advisor">M&A Advisor</SelectItem>
                <SelectItem value="deal-admin">Deal Admin</SelectItem>
                <SelectItem value="bidder-lead">Bidder Lead</SelectItem>
                <SelectItem value="bidder-member">Bidder Member</SelectItem>
                <SelectItem value="clean-team">Clean Team</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Access Permissions</Label>
            <div className="flex flex-wrap gap-2">
              {accessLevels.map(level => (
                <Badge
                  key={level}
                  variant={formData.accessLevel.includes(level) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleAccessLevelChange(level)}
                >
                  {level}
                  {formData.accessLevel.includes(level) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};