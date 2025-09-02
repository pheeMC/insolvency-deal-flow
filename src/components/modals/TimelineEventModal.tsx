import { useState } from 'react';
import { supabaseTimelineService as timelineService } from '@/services/supabaseTimelineService';
import { TimelineEvent } from '@/types/api';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';

interface TimelineEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (event: TimelineEvent) => void;
  event?: TimelineEvent | null;
}

export function TimelineEventModal({
  open,
  onOpenChange,
  onEventCreated,
  event,
}: TimelineEventModalProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(event?.time || '');
  const [type, setType] = useState<TimelineEvent['type']>(event?.type || 'milestone');
  const [status, setStatus] = useState<TimelineEvent['status']>(event?.status || 'upcoming');
  const [participants, setParticipants] = useState(event?.participants?.join(', ') || '');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !date) return;

    setCreating(true);
    try {
      const toastId = showLoadingToast(event ? 'Updating event...' : 'Creating event...');
      
      const eventData = {
        title,
        description,
        date,
        time: time || null,
        type,
        status,
        participants: participants ? participants.split(',').map(p => p.trim()) : [],
      };

      let newEvent: TimelineEvent;
      if (event) {
        newEvent = await timelineService.updateEvent(event.id, eventData);
      } else {
        newEvent = await timelineService.createEvent(eventData);
      }

      toast.dismiss(toastId);
      showSuccessToast(event ? 'Event updated successfully' : 'Event created successfully');
      onEventCreated(newEvent);
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('');
      setType('milestone');
      setStatus('upcoming');
      setParticipants('');
    } catch (error) {
      console.error('Failed to save event:', error);
      showErrorToast('Failed to save event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {event ? 'Edit Timeline Event' : 'New Timeline Event'}
          </DialogTitle>
          <DialogDescription>
            {event ? 'Update the timeline event details.' : 'Create a new milestone or event for the timeline.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the event"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time (Optional)</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: TimelineEvent['type']) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="qa">Q&A</SelectItem>
                  <SelectItem value="bid">Bid</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: TimelineEvent['status']) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants">Participants (Optional)</Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="John Doe, Jane Smith (comma separated)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !description.trim() || !date || creating}
          >
            {creating ? (event ? 'Updating...' : 'Creating...') : (event ? 'Update Event' : 'Create Event')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}