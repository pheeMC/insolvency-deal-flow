import { useState, useEffect } from 'react';
import { supabaseTimelineService as timelineService } from '@/services/supabaseTimelineService';
import { TimelineEvent as ApiTimelineEvent } from '@/types/api';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  Gavel,
  ArrowRight,
  Plus,
  Edit,
} from 'lucide-react';

interface LocalTimelineEvent {
  id: string;
  phase: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'delayed';
  startDate: string;
  endDate: string;
  progress: number;
  dependencies?: string[];
  assignee: string;
  milestones: {
    title: string;
    completed: boolean;
    dueDate: string;
  }[];
}

const timelineEvents: LocalTimelineEvent[] = [
  {
    id: '1',
    phase: 'Phase 1',
    title: 'NDA & Initial Access',
    description: 'Execute NDAs with potential bidders and provide initial access to teaser materials',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    progress: 100,
    assignee: 'M&A Team',
    milestones: [
      { title: 'NDA templates prepared', completed: true, dueDate: '2024-01-02' },
      { title: 'Bidder identification', completed: true, dueDate: '2024-01-05' },
      { title: 'NDA execution', completed: true, dueDate: '2024-01-10' },
      { title: 'Teaser distribution', completed: true, dueDate: '2024-01-15' },
    ],
  },
  {
    id: '2',
    phase: 'Phase 2',
    title: 'Initial Offers (IOI)',
    description: 'Collect and evaluate initial indications of interest from qualified bidders',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    progress: 100,
    assignee: 'Deal Team',
    milestones: [
      { title: 'Data room setup', completed: true, dueDate: '2024-01-16' },
      { title: 'IOI guidelines sent', completed: true, dueDate: '2024-01-18' },
      { title: 'IOI submission deadline', completed: true, dueDate: '2024-01-25' },
      { title: 'Initial bid evaluation', completed: true, dueDate: '2024-01-27' },
    ],
  },
  {
    id: '3',
    phase: 'Phase 3',
    title: 'Non-Binding Offers (NBO)',
    description: 'Enhanced due diligence and non-binding offer submission',
    status: 'current',
    startDate: '2024-01-25',
    endDate: '2024-02-15',
    progress: 65,
    assignee: 'Legal & Financial Team',
    milestones: [
      { title: 'Enhanced DD materials', completed: true, dueDate: '2024-01-26' },
      { title: 'Management presentations', completed: true, dueDate: '2024-02-01' },
      { title: 'Q&A process', completed: false, dueDate: '2024-02-10' },
      { title: 'NBO submission', completed: false, dueDate: '2024-02-15' },
    ],
  },
  {
    id: '4',
    phase: 'Phase 4',
    title: 'Final Bids & Selection',
    description: 'Binding offers, final negotiations, and preferred bidder selection',
    status: 'upcoming',
    startDate: '2024-02-15',
    endDate: '2024-03-01',
    progress: 0,
    assignee: 'Executive Team',
    milestones: [
      { title: 'Binding bid guidelines', completed: false, dueDate: '2024-02-16' },
      { title: 'Final DD completion', completed: false, dueDate: '2024-02-25' },
      { title: 'Binding offers due', completed: false, dueDate: '2024-03-01' },
      { title: 'Preferred bidder selection', completed: false, dueDate: '2024-03-05' },
    ],
  },
  {
    id: '5',
    phase: 'Phase 5',
    title: 'Transaction Execution',
    description: 'Final negotiations, SPA signing, and closing',
    status: 'upcoming',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    progress: 0,
    assignee: 'Legal Team',
    milestones: [
      { title: 'SPA negotiations', completed: false, dueDate: '2024-03-15' },
      { title: 'Regulatory approvals', completed: false, dueDate: '2024-03-30' },
      { title: 'SPA signing', completed: false, dueDate: '2024-04-01' },
      { title: 'Closing', completed: false, dueDate: '2024-04-15' },
    ],
  },
];

export default function Timeline() {
  const [events, setEvents] = useState<ApiTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load timeline events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await timelineService.getEvents();
        setEvents(response);
      } catch (error) {
        console.error('Failed to fetch timeline events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Use mock data for display
  const displayEvents = timelineEvents;

  // Find current phase from mock data
  const currentPhase = timelineEvents.find(event => event.status === 'current');

  const getStatusIcon = (status: LocalTimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'current':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: LocalTimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'current':
        return 'secondary';
      case 'delayed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Timeline</h1>
          <p className="text-muted-foreground mt-2">
            Track progress and milestones for the M&A transaction
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Timeline
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Current Phase Summary */}
      {currentPhase && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{currentPhase.phase}</Badge>
                  <Badge variant={getStatusBadgeVariant(currentPhase.status)}>
                    Current Phase
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-2">{currentPhase.title}</h3>
                <p className="text-muted-foreground mb-4">{currentPhase.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {formatDate(currentPhase.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{calculateDaysRemaining(currentPhase.endDate)} days remaining</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{currentPhase.assignee}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary mb-1">
                  {currentPhase.progress}%
                </div>
                <Progress value={currentPhase.progress} className="w-24 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {timelineEvents.slice(0, 4).map((event, index) => (
          <Card key={event.id} className={`${event.status === 'current' ? 'border-primary/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">{event.phase}</Badge>
                {getStatusIcon(event.status)}
              </div>
              <h4 className="font-medium text-sm mb-1">{event.title}</h4>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {event.description}
              </p>
              <div className="space-y-2">
                <Progress value={event.progress} className="h-1" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDate(event.startDate)}</span>
                  <span>{event.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detailed Timeline & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline Line */}
              {index < timelineEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
              )}
              
              <div className="flex gap-6">
                {/* Timeline Dot */}
                <div className="flex-shrink-0">
                  <div className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    ${event.status === 'completed' ? 'bg-success border-success' : ''}
                    ${event.status === 'current' ? 'bg-primary border-primary' : ''}
                    ${event.status === 'upcoming' ? 'bg-background border-border' : ''}
                    ${event.status === 'delayed' ? 'bg-destructive border-destructive' : ''}
                  `}>
                    {getStatusIcon(event.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{event.phase}</Badge>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">
                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={event.progress} className="w-20 h-2" />
                        <span className="text-sm font-medium">{event.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="bg-accent/30 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-sm">Milestones</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {event.milestones.map((milestone, mIndex) => (
                        <div key={mIndex} className="flex items-center gap-3">
                          {milestone.completed ? (
                            <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 border border-border rounded-full flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due: {formatDate(milestone.dueDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Assignee: {event.assignee}</span>
                    </div>
                    {event.status === 'current' && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{calculateDaysRemaining(event.endDate)} days remaining</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}