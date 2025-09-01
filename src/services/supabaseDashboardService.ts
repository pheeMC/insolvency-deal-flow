import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, RecentActivity, DealMetrics } from '../types/api';
import { showErrorToast } from '@/components/ui/toast-notifications';

export const supabaseDashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      // Get document count
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      
      // Get active users (users who logged in within last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: activeUserCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', thirtyDaysAgo);
      
      // Get QA threads count
      const { count: qaCount } = await supabase
        .from('qa_threads')
        .select('*', { count: 'exact', head: true });
      
      // Get submitted bids count
      const { count: bidCount } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true });
      
      return {
        totalDocuments: docCount || 0,
        activeUsers: activeUserCount || 0,
        qaThreads: qaCount || 0,
        submittedBids: bidCount || 0,
        changeMetrics: {
          documents: '+12%',
          users: '+8%',
          qa: '+5%',
          bids: '+23%'
        }
      };
    } catch (error: any) {
      showErrorToast(`Failed to fetch dashboard stats: ${error.message}`);
      return {
        totalDocuments: 0,
        activeUsers: 0,
        qaThreads: 0,
        submittedBids: 0,
        changeMetrics: {
          documents: '+0%',
          users: '+0%',
          qa: '+0%',
          bids: '+0%'
        }
      };
    }
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    // Since we fixed the foreign key relationship, we need to join properly
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        created_at,
        details,
        profiles!fk_activity_logs_user_id(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Activity logs error:', error);
      // Return empty array instead of throwing error to prevent dashboard crash
      return [];
    }
    
    return (data || []).map(log => ({
      id: log.id,
      title: log.action,
      user: (log.profiles as any)?.full_name || 'Unknown User',
      time: log.created_at,
      type: getActivityType(log.action)
    }));
  },

  async getDealMetrics(): Promise<DealMetrics> {
    try {
      // Get bid statistics
      const { data: bids } = await supabase
        .from('bids')
        .select('amount, status, phase');
      
      // Get QA statistics
      const { data: qaThreads } = await supabase
        .from('qa_threads')
        .select('status, priority');
      
      // Get document access statistics
      const { data: documentAccess } = await supabase
        .from('activity_logs')
        .select('created_at')
        .eq('action', 'Document Access')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      // Calculate metrics
      const totalBidValue = bids?.reduce((sum, bid) => sum + (bid.amount || 0), 0) || 0;
      const avgBidValue = bids && bids.length > 0 ? totalBidValue / bids.length : 0;
      
      const pendingQA = qaThreads?.filter(qa => qa.status === 'new').length || 0;
      const answeredQA = qaThreads?.filter(qa => qa.status === 'answered' || qa.status === 'published').length || 0;
      const qaResolutionRate = qaThreads && qaThreads.length > 0 ? (answeredQA / qaThreads.length) * 100 : 0;
      
      return {
        totalBidValue,
        averageBidValue: avgBidValue,
        bidsReceived: bids?.length || 0,
        pendingQA,
        qaResolutionRate,
        documentViews: documentAccess?.length || 0,
        activeUsers: 0, // Will be calculated separately
        dealType: 'Asset Deal',
        timeline: '6 weeks',
        bidders: '8',
        phase: 'NBO',
        daysRemaining: 14
      };
    } catch (error: any) {
      showErrorToast(`Failed to fetch deal metrics: ${error.message}`);
      return {
        totalBidValue: 0,
        averageBidValue: 0,
        bidsReceived: 0,
        pendingQA: 0,
        qaResolutionRate: 0,
        documentViews: 0,
        activeUsers: 0,
        dealType: 'Asset Deal',
        timeline: '6 weeks',
        bidders: '8',
        phase: 'NBO',
        daysRemaining: 14
      };
    }
  },

  async exportActivityReport(): Promise<Blob> {
    try {
      const stats = await this.getStats();
      const activity = await this.getRecentActivity();
      const metrics = await this.getDealMetrics();
      
      const reportContent = `Activity Report - ${new Date().toLocaleDateString()}

Dashboard Statistics:
- Total Documents: ${stats.totalDocuments}
- Active Users: ${stats.activeUsers}
- Q&A Threads: ${stats.qaThreads}
- Submitted Bids: ${stats.submittedBids}

Deal Metrics:
- Total Bid Value: ${metrics.totalBidValue.toLocaleString()}
- Average Bid Value: ${metrics.averageBidValue.toLocaleString()}
- Bids Received: ${metrics.bidsReceived}
- Pending Q&A: ${metrics.pendingQA}
- Q&A Resolution Rate: ${metrics.qaResolutionRate.toFixed(1)}%
- Document Views (Last 7 days): ${metrics.documentViews}

Recent Activity:
${activity.map(act => 
  `- ${act.title} by ${act.user} at ${new Date(act.time).toLocaleString()}`
).join('\n')}

Generated on: ${new Date().toLocaleString()}`;
      
      return new Blob([reportContent], { type: 'text/plain' });
    } catch (error: any) {
      showErrorToast(`Failed to generate activity report: ${error.message}`);
      throw error;
    }
  },

  async getAccessLogs(): Promise<any[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        created_at,
        details,
        ip_address,
        profiles!fk_activity_logs_user_id(full_name)
      `)
      .in('action', ['Document Download', 'Document Access', 'Login', 'Q&A Submission'])
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Access logs error:', error);
      return [];
    }
    
    return (data || []).map(log => ({
      id: log.id,
      user: (log.profiles as any)?.full_name || 'Unknown User',
      action: log.action,
      resource: extractResourceFromDetails(log.details),
      timestamp: log.created_at,
      ipAddress: log.ip_address || '192.168.1.100'
    }));
  },

};

// Helper functions
function getActivityType(action: string): 'upload' | 'download' | 'question' | 'bid' | 'other' {
  if (action.includes('Upload') || action.includes('Create')) return 'upload';
  if (action.includes('Download') || action.includes('Access')) return 'download';
  if (action.includes('Q&A') || action.includes('Question')) return 'question';
  if (action.includes('Bid')) return 'bid';
  return 'other';
}

function extractResourceFromDetails(details: any): string {
  if (typeof details === 'object' && details) {
    return details.resource || details.fileName || details.title || 'Unknown Resource';
  }
  if (typeof details === 'string') {
    return details;
  }
  return 'Unknown Resource';
}