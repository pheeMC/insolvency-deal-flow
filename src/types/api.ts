// API Base Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalDocuments: number;
  activeUsers: number;
  qaThreads: number;
  submittedBids: number;
  changeMetrics: {
    documents: string;
    users: string;
    qa: string;
    bids: string;
  };
}

export interface RecentActivity {
  id: string;
  type: 'document' | 'qa' | 'bid' | 'access';
  title: string;
  user: string;
  time: string;
  icon: string;
}

export interface DealMetrics {
  enterpriseValue: string;
  dealType: string;
  timeline: string;
  bidders: string;
  phase: string;
  daysRemaining: number;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  modifiedBy: string;
  access: 'full' | 'restricted' | 'clean-team';
  watermark: boolean;
  parentId?: string;
  children?: Document[];
}

export interface DocumentUpload {
  name: string;
  file: File;
  folderId?: string;
  access: 'full' | 'restricted' | 'clean-team';
  watermark: boolean;
}

// Q&A Types
export interface QAThread {
  id: string;
  category: string;
  title: string;
  question: string;
  answer?: string;
  status: 'new' | 'in-review' | 'answered' | 'published';
  priority: 'low' | 'medium' | 'high';
  askedBy: string;
  askedAt: string;
  answeredBy?: string;
  answeredAt?: string;
  visibility: 'all-bidders' | 'specific-bidder' | 'internal';
  attachments?: string[];
}

export interface QAFilter {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}

// User Types
export interface User {
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

export interface UserFilter {
  role?: string;
  status?: string;
  organization?: string;
  search?: string;
}

// Bid Types
export interface Bid {
  id: string;
  bidderName: string;
  bidderType: 'strategic' | 'financial';
  amount: number;
  currency: string;
  phase: 'IOI' | 'NBO' | 'Final';
  status: 'draft' | 'submitted' | 'reviewed' | 'shortlisted' | 'rejected';
  submittedAt: string;
  submittedBy: string;
  conditions?: string[];
  attachments?: string[];
}

// Timeline Types
export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  type: 'milestone' | 'document' | 'qa' | 'bid' | 'meeting';
  status: 'completed' | 'ongoing' | 'upcoming';
  participants?: string[];
}

// Settings Types
export interface DealSettings {
  dealName: string;
  dealType: string;
  phase: string;
  timeline: {
    nboDeadline: string;
    finalBidDeadline: string;
    closingExpected: string;
  };
  access: {
    watermarkEnabled: boolean;
    downloadRestrictions: boolean;
    auditLogging: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    qaNotifications: boolean;
    bidNotifications: boolean;
  };
}