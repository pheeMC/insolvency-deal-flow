import { apiClient } from './api';
import { ApiResponse, DashboardStats, RecentActivity, DealMetrics } from '../types/api';
import { mockDashboardStats, mockRecentActivity, mockDealMetrics } from './mockData';

export const dashboardService = {
  // GET /dashboard/stats
  async getStats(): Promise<DashboardStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardStats;
  },

  // GET /dashboard/recent-activity
  async getRecentActivity(): Promise<RecentActivity[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRecentActivity;
  },

  // GET /dashboard/deal-metrics
  async getDealMetrics(): Promise<DealMetrics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockDealMetrics;
  },

  // GET /dashboard/export/activity-report
  async exportActivityReport(): Promise<Blob> {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reportContent = `Activity Report - ${new Date().toLocaleDateString()}

Dashboard Statistics:
- Total Documents: ${mockDashboardStats.totalDocuments}
- Active Users: ${mockDashboardStats.activeUsers}
- Q&A Threads: ${mockDashboardStats.qaThreads}
- Submitted Bids: ${mockDashboardStats.submittedBids}

Recent Activity:
${mockRecentActivity.map(activity => 
  `- ${activity.title} by ${activity.user} at ${new Date(activity.time).toLocaleString()}`
).join('\n')}

Generated on: ${new Date().toLocaleString()}`;

    return new Blob([reportContent], { type: 'text/plain' });
  },

  // GET /dashboard/access-logs
  async getAccessLogs(): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: '1',
        user: 'Michael Chen',
        action: 'Document Download',
        resource: 'Financial Statements Q3 2024.pdf',
        timestamp: '2024-01-17T16:30:00Z',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        user: 'Emma Wilson',
        action: 'Q&A Submission',
        resource: 'Working capital requirements',
        timestamp: '2024-01-17T11:00:00Z',
        ipAddress: '192.168.1.101'
      },
      {
        id: '3',
        user: 'Sarah Johnson',
        action: 'Document Upload',
        resource: 'Management Accounts.xlsx',
        timestamp: '2024-01-15T16:00:00Z',
        ipAddress: '192.168.1.102'
      }
    ];
  },
};