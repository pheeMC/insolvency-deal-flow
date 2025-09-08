import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  MessageCircle,
  Users,
  Gavel,
  Clock,
  TrendingUp,
  Download,
  Eye,
  AlertCircle,
  Building2,
  Euro,
  Calendar,
  Activity
} from 'lucide-react';
import { supabaseDashboardService as dashboardService } from '@/services/supabaseDashboardService';
import { supabaseSettingsService as settingsService } from '@/services/supabaseSettingsService';
import { supabaseTimelineService } from '@/services/supabaseTimelineService';
import { supabaseQAService } from '@/services/supabaseQAService';
import { DashboardStats, RecentActivity, DealMetrics, DealSettings, TimelineEvent } from '@/types/api';

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dealMetrics, setDealMetrics] = useState<DealMetrics | null>(null);
  const [dealSettings, setDealSettings] = useState<DealSettings | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [pendingQAs, setPendingQAs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, activity, metrics, settings, timeline, qaThreads] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(),
          dashboardService.getDealMetrics(),
          settingsService.getSettings(),
          supabaseTimelineService.getEvents(),
          supabaseQAService.getThreads(),
        ]);
        
        console.log('Dashboard stats received:', stats);
        console.log('Stats changeMetrics:', stats?.changeMetrics);
        console.log('Deal settings loaded:', settings);
        
        setDashboardStats(stats);
        setRecentActivity(activity);
        setDealMetrics(metrics);
        setDealSettings(settings);
        setTimelineEvents(timeline);
        setPendingQAs(qaThreads.data.filter(qa => qa.status === 'new').length);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardStats && dashboardStats.changeMetrics ? [
    {
      title: 'Total Documents',
      value: dashboardStats.totalDocuments.toString(),
      change: dashboardStats.changeMetrics.documents || '+0%',
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'Active Users',
      value: dashboardStats.activeUsers.toString(),
      change: dashboardStats.changeMetrics.users || '+8%',
      icon: Users,
      color: 'text-success',
    },
    {
      title: 'Q&A Threads',
      value: dashboardStats.qaThreads.toString(),
      change: dashboardStats.changeMetrics.qa || '+5%',
      icon: MessageCircle,
      color: 'text-warning',
    },
    {
      title: 'Submitted Bids',
      value: dashboardStats.submittedBids.toString(),
      change: dashboardStats.changeMetrics.bids || '+23%',
      icon: Gavel,
      color: 'text-primary',
    },
  ] : [];

  const dealMetricsData = dealMetrics ? [
    {
      label: 'Enterprise Value',
      value: `€${dealMetrics.totalBidValue.toLocaleString()}`,
      subtext: 'Indicative range: €100M - €150M',
      icon: Euro,
    },
    {
      label: 'Deal Type',
      value: dealMetrics.dealType,
      subtext: 'Insolvency Proceedings',
      icon: Building2,
    },
    {
      label: 'Timeline',
      value: dealMetrics.timeline,
      subtext: 'Until NBO deadline',
      icon: Calendar,
    },
    {
      label: 'Bidders',
      value: dealMetrics.bidders,
      subtext: '3 Strategic, 5 Financial',
      icon: Activity,
    },
  ] : [];

  const handleExportReport = async () => {
    try {
      const blob = await dashboardService.exportActivityReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'activity-report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const handleViewAccessLogs = async () => {
    try {
      await dashboardService.getAccessLogs();
      // Navigate to access logs view or show in modal
    } catch (error) {
      console.error('Failed to fetch access logs:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Deal Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dealSettings?.dealName || 'Loading...'} - {dealSettings?.dealType || 'Asset Deal'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {dealSettings?.phase || 'Insolvency proceeding'} data room managed by Deal Administrator
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <Clock className="h-3 w-3" />
            Phase: {dealSettings?.phase || dealMetrics?.phase || 'NBO'}
          </Badge>
          <Badge variant="secondary">
            {dealSettings?.nboDeadline ? 
              `${Math.max(1, Math.ceil((new Date(dealSettings.nboDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining` :
              `${dealMetrics?.daysRemaining || 14} days remaining`
            }
          </Badge>
        </div>
      </div>

      {/* Key Deal Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dealMetricsData.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.label} className="vdr-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <IconComponent className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.subtext}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="vdr-card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success">{stat.change}</span> from last week
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Deal Timeline & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {timelineEvents.length > 0 ? (
              timelineEvents.slice(0, 4).map((event) => {
                const isCompleted = event.status === 'completed';
                const isCurrent = event.status === 'ongoing';
                const progress = isCompleted ? 100 : isCurrent ? 65 : 0;
                
                return (
                  <div key={event.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{event.title}</span>
                      <Badge variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}>
                        {isCompleted ? "Completed" : isCurrent ? "Current Phase" : "Upcoming"}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No timeline events found</p>
                <p className="text-xs mt-1">Add events in the Timeline section</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                // Map icon string to actual icon component
                const IconComponent = activity.type === 'document' ? FileText :
                                     activity.type === 'qa' ? MessageCircle :
                                     activity.type === 'bid' ? Gavel : Users;
                return (
                  <div key={activity.id} className="flex gap-3 items-start">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <IconComponent className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} · {new Date(activity.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingQAs > 0 && (
              <div className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Q&A Response Due</p>
                  <p className="text-xs text-muted-foreground">{pendingQAs} questions awaiting response</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/qa'}>
                  Review
                </Button>
              </div>
            )}
            
            {dealSettings?.nboDeadline && (
              <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Bid Deadline Approaching</p>
                  <p className="text-xs text-muted-foreground">
                    NBO deadline: {new Date(dealSettings.nboDeadline).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" onClick={() => window.location.href = '/timeline'}>
                  View Details
                </Button>
              </div>
            )}
            
            {pendingQAs === 0 && !dealSettings?.nboDeadline && (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">No action items at this time</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4" />
              Export Activity Report
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={handleViewAccessLogs}>
              <Eye className="h-4 w-4" />
              View Access Logs
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Users className="h-4 w-4" />
              Manage User Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}