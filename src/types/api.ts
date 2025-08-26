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
}

export interface RecentActivity {
  id: string;
  type: 'upload' | 'download' | 'question' | 'bid' | 'other';
  title: string;
  user: string;
  time: string;
}

export interface DealMetrics {
  totalBidValue: number;
  averageBidValue: number;
  bidsReceived: number;
  pendingQA: number;
  qaResolutionRate: number;
  documentViews: number;
  activeUsers: number;
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
  status: string;
  priority: string;
  askedBy: string;
  askedAt: string;
  answeredBy?: string;
  answeredAt?: string;
  visibility: string;
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
  bidderType: string;
  amount: number;
  currency: string;
  phase: string;
  status: string;
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
  nboDeadline: string;
  finalBidDeadline: string;
  closingExpected: string;
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