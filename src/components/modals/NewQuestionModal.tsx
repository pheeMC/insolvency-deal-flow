import { useState } from 'react';
import { supabaseQAService as qaService } from '@/services/supabaseQAService';
import { QAThread } from '@/types/api';
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
import { MessageCircle, Plus } from 'lucide-react';

interface NewQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionCreated: (thread: QAThread) => void;
}

export function NewQuestionModal({
  open,
  onOpenChange,
  onQuestionCreated,
}: NewQuestionModalProps) {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<QAThread['priority']>('medium');
  const [visibility, setVisibility] = useState<QAThread['visibility']>('all-bidders');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !question.trim() || !category) return;

    setCreating(true);
    try {
      const toastId = showLoadingToast('Creating question...');
      
      const newThread = await qaService.createThread({
        title,
        question,
        category,
        priority,
        visibility,
        askedBy: 'Current User'
      });

      toast.dismiss(toastId);
      showSuccessToast('Question created successfully');
      onQuestionCreated(newThread);
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setQuestion('');
      setCategory('');
      setPriority('medium');
      setVisibility('all-bidders');
    } catch (error) {
      console.error('Failed to create question:', error);
      showErrorToast('Failed to create question');
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
            New Question
          </DialogTitle>
          <DialogDescription>
            Submit a new question for the Q&A process. Questions will be reviewed before being answered.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Question Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your question"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question Details</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Provide detailed information about your question..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                  <SelectItem value="Regulatory">Regulatory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: QAThread['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(value: QAThread['visibility']) => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-bidders">All Bidders</SelectItem>
                <SelectItem value="specific-bidder">Specific Bidder</SelectItem>
                <SelectItem value="internal">Internal Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!title.trim() || !question.trim() || !category || creating}
          >
            {creating ? 'Creating...' : 'Create Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}