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
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      title: 'Documents',
      value: '247',
      change: '+12%',
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'Active Users',
      value: '18',
      change: '+3',
      icon: Users,
      color: 'text-success',
    },
    {
      title: 'Q&A Threads',
      value: '42',
      change: '+8',
      icon: MessageCircle,
      color: 'text-warning',
    },
    {
      title: 'Submitted Bids',
      value: '6',
      change: '+2',
      icon: Gavel,
      color: 'text-primary',
    },
  ];

  const recentActivity = [
    {
      type: 'document',
      title: 'Financial Statements Q3 2024 uploaded',
      user: 'M&A Advisor',
      time: '2 hours ago',
      icon: FileText,
    },
    {
      type: 'qa',
      title: 'New question about employee contracts',
      user: 'Bidder Alpha Lead',
      time: '4 hours ago',
      icon: MessageCircle,
    },
    {
      type: 'bid',
      title: 'Bid revision submitted',
      user: 'Strategic Investor B',
      time: '1 day ago',
      icon: Gavel,
    },
    {
      type: 'access',
      title: 'New team member added',
      user: 'Deal Admin',
      time: '2 days ago',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Deal Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Labforward GmbH - Asset Deal</h1>
          <p className="text-muted-foreground mt-2">
            Insolvency proceeding data room managed by SATUS Real Estate
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <Clock className="h-3 w-3" />
            Phase: NBO
          </Badge>
          <Badge variant="secondary">
            14 days remaining
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">NDA Execution</span>
                <Badge variant="default">Completed</Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Initial Offer (IOI)</span>
                <Badge variant="default">Completed</Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Non-Binding Offer (NBO)</span>
                <Badge variant="secondary">Current Phase</Badge>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Binding Offer</span>
                <Badge variant="outline">Upcoming</Badge>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <IconComponent className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} · {activity.time}
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
            <div className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div>
                <p className="text-sm font-medium">Q&A Response Due</p>
                <p className="text-xs text-muted-foreground">3 questions awaiting response</p>
              </div>
              <Button size="sm" variant="outline">
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div>
                <p className="text-sm font-medium">Bid Deadline Approaching</p>
                <p className="text-xs text-muted-foreground">NBO phase ends in 14 days</p>
              </div>
              <Button size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Download className="h-4 w-4" />
              Export Activity Report
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
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