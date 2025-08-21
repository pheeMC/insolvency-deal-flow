import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  Shield,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Eye,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'insolvency-admin' | 'ma-advisor' | 'deal-admin' | 'bidder-lead' | 'bidder-member' | 'clean-team' | 'viewer';
  organization: string;
  status: 'active' | 'pending' | 'suspended';
  lastLogin?: string;
  joinedAt: string;
  accessLevel: string[];
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@test-company.de',
    role: 'owner',
    organization: 'Test GmbH',
    status: 'active',
    lastLogin: '2024-01-17T10:30:00Z',
    joinedAt: '2024-01-01T00:00:00Z',
    accessLevel: ['All Documents', 'Admin Panel', 'User Management'],
  },
  {
    id: '2',
    name: 'Dr. Mueller',
    email: 'mueller@insolvency-admin.de',
    role: 'insolvency-admin',
    organization: 'Insolvency Court',
    status: 'active',
    lastLogin: '2024-01-17T09:15:00Z',
    joinedAt: '2024-01-02T00:00:00Z',
    accessLevel: ['90_InsO', 'Bid Management', 'Reports'],
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@ma-advisors.com',
    role: 'ma-advisor',
    organization: 'M&A Advisors Ltd',
    status: 'active',
    lastLogin: '2024-01-16T16:45:00Z',
    joinedAt: '2024-01-03T00:00:00Z',
    accessLevel: ['Documents', 'Q&A Management', 'Bid Review'],
  },
  {
    id: '4',
    name: 'Michael Chen',
    email: 'mchen@strategic-alpha.com',
    role: 'bidder-lead',
    organization: 'Strategic Investor Alpha',
    status: 'active',
    lastLogin: '2024-01-17T08:00:00Z',
    joinedAt: '2024-01-05T00:00:00Z',
    accessLevel: ['Phase 2 Documents', 'Q&A Submission', 'Bid Management'],
  },
  {
    id: '5',
    name: 'Lisa Brown',
    email: 'lisa@financial-beta.com',
    role: 'bidder-member',
    organization: 'Financial Investor Beta',
    status: 'pending',
    joinedAt: '2024-01-16T00:00:00Z',
    accessLevel: ['Phase 1 Documents', 'Q&A View'],
  },
  {
    id: '6',
    name: 'Robert Wilson',
    email: 'rwilson@cleanteam.com',
    role: 'clean-team',
    organization: 'HR Clean Team',
    status: 'active',
    lastLogin: '2024-01-15T14:20:00Z',
    joinedAt: '2024-01-10T00:00:00Z',
    accessLevel: ['05_HR', 'Employee Data', 'Clean Team Reports'],
  },
];

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<User | null>(mockUsers[0]);
  const [filter, setFilter] = useState({
    role: 'all',
    status: 'all',
    organization: 'all',
  });

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'insolvency-admin':
        return 'destructive';
      case 'ma-advisor':
        return 'secondary';
      case 'bidder-lead':
        return 'outline';
      case 'clean-team':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'destructive';
    }
  };

  const getRoleDisplayName = (role: User['role']) => {
    const roleMap = {
      'owner': 'Owner',
      'insolvency-admin': 'Insolvency Admin',
      'ma-advisor': 'M&A Advisor',
      'deal-admin': 'Deal Admin',
      'bidder-lead': 'Bidder Lead',
      'bidder-member': 'Bidder Member',
      'clean-team': 'Clean Team',
      'viewer': 'Viewer',
    };
    return roleMap[role] || role;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
          <p className="text-muted-foreground mt-2">
            Manage user access, roles, and permissions for the data room
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
          />
        </div>
        <Select value={filter.role} onValueChange={(value) => setFilter({...filter, role: value})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="insolvency-admin">Insolvency Admin</SelectItem>
            <SelectItem value="ma-advisor">M&A Advisor</SelectItem>
            <SelectItem value="bidder-lead">Bidder Lead</SelectItem>
            <SelectItem value="clean-team">Clean Team</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.status} onValueChange={(value) => setFilter({...filter, status: value})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Team Members ({mockUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {mockUsers.map(user => (
                  <div
                    key={user.id}
                    className={`
                      p-4 cursor-pointer hover:bg-accent/50 border-b border-border/50
                      ${selectedUser?.id === user.id ? 'bg-primary/5 border-primary/50' : ''}
                    `}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/${user.id}.jpg`} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm truncate">{user.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                              {user.status}
                            </Badge>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                              {getRoleDisplayName(user.role)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.organization}</p>
                        {user.lastLogin && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Last login: {formatDateTime(user.lastLogin)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div>
          {selectedUser ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/avatars/${selectedUser.id}.jpg`} alt={selectedUser.name} />
                    <AvatarFallback>
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <div className="mt-1">
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {getRoleDisplayName(selectedUser.role)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Organization:</span>
                    <p className="font-medium">{selectedUser.organization}</p>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Joined:</span>
                    <p className="font-medium">{formatDate(selectedUser.joinedAt)}</p>
                  </div>

                  {selectedUser.lastLogin && (
                    <div>
                      <span className="text-sm text-muted-foreground">Last Login:</span>
                      <p className="font-medium">{formatDateTime(selectedUser.lastLogin)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Access Permissions</h4>
                  <div className="space-y-1">
                    {selectedUser.accessLevel.map((permission, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Shield className="h-3 w-3 text-primary" />
                        <span>{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Button className="w-full gap-2" size="sm">
                    <Edit className="h-3 w-3" />
                    Edit User
                  </Button>
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <Mail className="h-3 w-3" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <Eye className="h-3 w-3" />
                    View Activity
                  </Button>
                  {selectedUser.status !== 'suspended' && (
                    <Button variant="destructive" className="w-full gap-2" size="sm">
                      <Trash2 className="h-3 w-3" />
                      Suspend User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a user to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}