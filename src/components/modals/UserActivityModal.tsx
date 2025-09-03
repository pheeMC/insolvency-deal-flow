import { useState, useEffect } from 'react';
import { User } from '@/types/api';
import { supabaseUsersService as usersService } from '@/services/supabaseUsersService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, MessageCircle, Download, Eye } from 'lucide-react';

interface UserActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

interface ActivityItem {
  id: string;
  action: string;
  details: any;
  created_at: string;
  resource_type?: string;
}

export const UserActivityModal = ({ open, onOpenChange, user }: UserActivityModalProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      loadUserActivity();
    }
  }, [user, open]);

  const loadUserActivity = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await usersService.getUserActivity(user.id);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string, resourceType?: string) => {
    if (action.includes('login')) return <Eye className="h-4 w-4" />;
    if (action.includes('download')) return <Download className="h-4 w-4" />;
    if (resourceType === 'document') return <FileText className="h-4 w-4" />;
    if (resourceType === 'qa_thread') return <MessageCircle className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getActivityBadge = (action: string) => {
    if (action.includes('login')) return 'secondary';
    if (action.includes('download')) return 'outline';
    if (action.includes('create')) return 'default';
    if (action.includes('update')) return 'secondary';
    return 'outline';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Activity - {user?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading activity...</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No activity found for this user.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.action, activity.resource_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getActivityBadge(activity.action)} className="text-xs">
                          {activity.resource_type || 'system'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {activity.details && (
                      <div className="text-sm text-muted-foreground">
                        {typeof activity.details === 'object' ? (
                          <div className="space-y-1">
                            {Object.entries(activity.details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{' '}
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          activity.details
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};