import { useState } from 'react';
import { usersService } from '@/services/usersService';
import { User } from '@/types/api';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Mail } from 'lucide-react';

interface UserInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteComplete: (user: User) => void;
}

const accessLevelOptions = [
  'Phase 1 Documents',
  'Phase 2 Documents',
  'Financial Information',
  'Legal Documents',
  'Q&A Submission',
  'Bid Submission',
  'Clean Team Documents',
  'Admin Rights',
  'User Management',
];

export function UserInviteModal({
  open,
  onOpenChange,
  onInviteComplete,
}: UserInviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('viewer');
  const [organization, setOrganization] = useState('');
  const [accessLevel, setAccessLevel] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);

  const handleAccessLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setAccessLevel(prev => [...prev, level]);
    } else {
      setAccessLevel(prev => prev.filter(l => l !== level));
    }
  };

  const handleInvite = async () => {
    if (!email || !role || !organization) return;

    setInviting(true);
    try {
      const toastId = showLoadingToast('Sending invitation...');
      
      const newUser = await usersService.inviteUser(email, role, organization, accessLevel);

      toast.dismiss(toastId);
      showSuccessToast('User invitation sent successfully');
      onInviteComplete(newUser);
      onOpenChange(false);
      
      // Reset form
      setEmail('');
      setRole('viewer');
      setOrganization('');
      setAccessLevel([]);
    } catch (error) {
      console.error('Invitation failed:', error);
      showErrorToast('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite User
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join the data room with specific role and access permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Company Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: User['role']) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="bidder-member">Bidder Member</SelectItem>
                <SelectItem value="bidder-lead">Bidder Lead</SelectItem>
                <SelectItem value="clean-team">Clean Team</SelectItem>
                <SelectItem value="deal-admin">Deal Admin</SelectItem>
                <SelectItem value="ma-advisor">M&A Advisor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Access Permissions</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {accessLevelOptions.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={level}
                    checked={accessLevel.includes(level)}
                    onCheckedChange={(checked) => handleAccessLevelChange(level, checked as boolean)}
                  />
                  <Label htmlFor={level} className="text-sm">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={!email || !role || !organization || inviting}
          >
            {inviting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}