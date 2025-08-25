import { useState, useEffect } from 'react';
import { qaService } from '@/services/qaService';
import { QAThread } from '@/types/api';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';
import { NewQuestionModal } from '@/components/modals/NewQuestionModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Send,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function QA() {
  const [threads, setThreads] = useState<QAThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<QAThread | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [newQuestionModalOpen, setNewQuestionModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
  });

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await qaService.getThreads(filter);
        setThreads(response.data);
        if (response.data.length > 0 && !selectedThread) {
          setSelectedThread(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch Q&A threads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [filter]);

  const handleAnswerSubmit = async (publishTo: 'all-bidders' | 'specific-bidder' | 'draft' = 'draft') => {
    if (!selectedThread || !newAnswer.trim()) return;

    try {
      const toastId = showLoadingToast('Submitting answer...');
      const updatedThread = await qaService.answerThread(selectedThread.id, newAnswer, publishTo);
      setThreads(prev => prev.map(t => t.id === updatedThread.id ? updatedThread : t));
      setSelectedThread(updatedThread);
      setNewAnswer('');
      toast.dismiss(toastId);
      showSuccessToast(`Answer ${publishTo === 'draft' ? 'saved as draft' : 'published'} successfully`);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      showErrorToast('Failed to submit answer');
    }
  };

  const handleStatusUpdate = async (threadId: string, status: QAThread['status']) => {
    try {
      const toastId = showLoadingToast('Updating status...');
      const updatedThread = await qaService.updateStatus(threadId, status);
      setThreads(prev => prev.map(t => t.id === updatedThread.id ? updatedThread : t));
      if (selectedThread?.id === threadId) {
        setSelectedThread(updatedThread);
      }
      toast.dismiss(toastId);
      showSuccessToast('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      showErrorToast('Failed to update status');
    }
  };

  const handleQuestionCreated = (thread: QAThread) => {
    setThreads(prev => [thread, ...prev]);
    if (!selectedThread) {
      setSelectedThread(thread);
    }
  };

  const getStatusBadgeVariant = (status: QAThread['status']) => {
    switch (status) {
      case 'new':
        return 'destructive';
      case 'in-review':
        return 'secondary';
      case 'answered':
        return 'default';
      case 'published':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: QAThread['priority']) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="h-3 w-3 text-destructive" />;
      case 'medium':
        return <ArrowUp className="h-3 w-3 text-warning rotate-45" />;
      case 'low':
        return <ArrowDown className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading Q&A threads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Q&A Center</h1>
          <p className="text-muted-foreground mt-2">
            Manage questions and answers from bidders with controlled workflow
          </p>
        </div>
        <Button className="gap-2" onClick={() => setNewQuestionModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Question
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions and answers..."
            className="pl-10"
          />
        </div>
        <Select value={filter.status} onValueChange={(value) => setFilter({...filter, status: value})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.category} onValueChange={(value) => setFilter({...filter, category: value})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Legal">Legal</SelectItem>
            <SelectItem value="Financial">Financial</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Q&A List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Questions ({threads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {threads.map(thread => (
                  <div
                    key={thread.id}
                    className={`
                      p-4 cursor-pointer hover:bg-accent/50 border-b border-border/50
                      ${selectedThread?.id === thread.id ? 'bg-primary/5 border-primary/50' : ''}
                    `}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {thread.category}
                        </Badge>
                        {getPriorityIcon(thread.priority)}
                      </div>
                      <Badge variant={getStatusBadgeVariant(thread.status)} className="text-xs">
                        {thread.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{thread.askedBy}</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(thread.askedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Q&A Detail */}
        <div className="lg:col-span-2">
          {selectedThread ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {selectedThread.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedThread.category}</Badge>
                        {getPriorityIcon(selectedThread.priority)}
                        <span className="capitalize">{selectedThread.priority}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{selectedThread.askedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(selectedThread.askedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedThread.status)}>
                    {selectedThread.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Question
                  </h4>
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <p className="text-sm">{selectedThread.question}</p>
                  </div>
                </div>

                {/* Answer */}
                {selectedThread.answer ? (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Answer
                      {selectedThread.answeredBy && (
                        <span className="text-xs text-muted-foreground font-normal">
                          by {selectedThread.answeredBy}
                        </span>
                      )}
                    </h4>
                    <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
                      <p className="text-sm">{selectedThread.answer}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      Draft Answer
                    </h4>
                    <Textarea
                      placeholder="Type your answer here..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="mb-3"
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <Button size="sm" className="gap-2" onClick={() => handleAnswerSubmit('draft')}>
                        <Send className="h-3 w-3" />
                        Save Draft
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAnswerSubmit('all-bidders')}>
                        Publish to All Bidders
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAnswerSubmit('specific-bidder')}>
                        Send to Specific Bidder
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {selectedThread.status === 'new' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedThread.id, 'in-review')}>
                      Move to Review
                    </Button>
                  )}
                  {selectedThread.status === 'answered' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedThread.id, 'published')}>
                      Publish to FAQ
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Add Internal Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a question to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NewQuestionModal
        open={newQuestionModalOpen}
        onOpenChange={setNewQuestionModalOpen}
        onQuestionCreated={handleQuestionCreated}
      />
    </div>
  );
}