// Mock data for development - simulates backend responses
import { DashboardStats, RecentActivity, DealMetrics, Document, QAThread, User, Bid, TimelineEvent, DealSettings } from '../types/api';

// Dashboard Mock Data
export const mockDashboardStats: DashboardStats = {
  totalDocuments: 247,
  activeUsers: 18,
  qaThreads: 42,
  submittedBids: 6,
  changeMetrics: {
    documents: "+12%",
    users: "+3",
    qa: "+8",
    bids: "+2"
  }
};

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'document',
    title: 'Financial Statements Q3 2024 uploaded',
    user: 'M&A Advisor',
    time: '2024-01-17T10:30:00Z',
    icon: 'FileText'
  },
  {
    id: '2',
    type: 'qa',
    title: 'New question about employee contracts',
    user: 'Strategic Investor Alpha',
    time: '2024-01-17T09:15:00Z',
    icon: 'MessageCircle'
  },
  {
    id: '3',
    type: 'bid',
    title: 'NBO submitted by Financial Investor Beta',
    user: 'Financial Investor Beta',
    time: '2024-01-16T16:45:00Z',
    icon: 'Gavel'
  },
  {
    id: '4',
    type: 'access',
    title: 'Clean team member added',
    user: 'Deal Administrator',
    time: '2024-01-16T14:20:00Z',
    icon: 'Users'
  }
];

export const mockDealMetrics: DealMetrics = {
  enterpriseValue: "€125M",
  dealType: "Asset Deal",
  timeline: "14 Days",
  bidders: "8 Active",
  phase: "NBO",
  daysRemaining: 14
};

// Documents Mock Data
export const mockDocuments: Document[] = [
  {
    id: '00',
    name: '00_Admin',
    type: 'folder',
    modified: '2024-01-15T10:00:00Z',
    modifiedBy: 'Deal Administrator',
    access: 'restricted',
    watermark: true,
    children: [
      {
        id: '00-1',
        name: 'Process Letter.pdf',
        type: 'file',
        size: '2.3 MB',
        modified: '2024-01-15T10:00:00Z',
        modifiedBy: 'Deal Administrator',
        access: 'restricted',
        watermark: true,
        parentId: '00'
      },
      {
        id: '00-2',
        name: 'NDA Template.docx',
        type: 'file',
        size: '156 KB',
        modified: '2024-01-10T14:30:00Z',
        modifiedBy: 'Legal Team',
        access: 'restricted',
        watermark: true,
        parentId: '00'
      }
    ]
  },
  {
    id: '01',
    name: '01_Corporate',
    type: 'folder',
    modified: '2024-01-16T15:30:00Z',
    modifiedBy: 'M&A Advisor',
    access: 'full',
    watermark: true,
    children: [
      {
        id: '01-1',
        name: 'Articles of Association.pdf',
        type: 'file',
        size: '1.8 MB',
        modified: '2024-01-16T15:30:00Z',
        modifiedBy: 'Legal Team',
        access: 'full',
        watermark: true,
        parentId: '01'
      },
      {
        id: '01-2',
        name: 'Commercial Register Extract.pdf',
        type: 'file',
        size: '890 KB',
        modified: '2024-01-14T11:20:00Z',
        modifiedBy: 'Legal Team',
        access: 'full',
        watermark: true,
        parentId: '01'
      },
      {
        id: '01-3',
        name: 'Organizational Chart.xlsx',
        type: 'file',
        size: '245 KB',
        modified: '2024-01-12T09:45:00Z',
        modifiedBy: 'HR Team',
        access: 'full',
        watermark: true,
        parentId: '01'
      }
    ]
  },
  {
    id: '02',
    name: '02_Financials',
    type: 'folder',
    modified: '2024-01-17T10:30:00Z',
    modifiedBy: 'Financial Advisor',
    access: 'full',
    watermark: true,
    children: [
      {
        id: '02-1',
        name: 'Financial Statements Q3 2024.pdf',
        type: 'file',
        size: '4.2 MB',
        modified: '2024-01-17T10:30:00Z',
        modifiedBy: 'Financial Advisor',
        access: 'full',
        watermark: true,
        parentId: '02'
      },
      {
        id: '02-2',
        name: 'Management Accounts.xlsx',
        type: 'file',
        size: '1.5 MB',
        modified: '2024-01-15T16:00:00Z',
        modifiedBy: 'CFO',
        access: 'full',
        watermark: true,
        parentId: '02'
      },
      {
        id: '02-3',
        name: 'Budget 2024.xlsx',
        type: 'file',
        size: '678 KB',
        modified: '2024-01-10T13:15:00Z',
        modifiedBy: 'CFO',
        access: 'restricted',
        watermark: true,
        parentId: '02'
      }
    ]
  },
  {
    id: '90',
    name: '90_InsO',
    type: 'folder',
    modified: '2024-01-12T08:00:00Z',
    modifiedBy: 'Insolvency Administrator',
    access: 'clean-team',
    watermark: true,
    children: [
      {
        id: '90-1',
        name: 'Insolvency Order.pdf',
        type: 'file',
        size: '1.2 MB',
        modified: '2024-01-12T08:00:00Z',
        modifiedBy: 'Insolvency Administrator',
        access: 'clean-team',
        watermark: true,
        parentId: '90'
      },
      {
        id: '90-2',
        name: 'Creditor List.xlsx',
        type: 'file',
        size: '890 KB',
        modified: '2024-01-11T17:30:00Z',
        modifiedBy: 'Insolvency Administrator',
        access: 'clean-team',
        watermark: true,
        parentId: '90'
      }
    ]
  }
];

// Q&A Mock Data
export const mockQAThreads: QAThread[] = [
  {
    id: '1',
    category: 'Legal',
    title: 'Employee contract terms and conditions',
    question: 'Can you provide details about the current employee contracts, particularly regarding notice periods and severance terms?',
    answer: 'All employee contracts follow standard German employment law. Notice periods range from 1-6 months depending on tenure. Severance calculations are based on 0.5 monthly salaries per year of service.',
    status: 'published',
    priority: 'high',
    askedBy: 'Strategic Investor Alpha',
    askedAt: '2024-01-16T14:30:00Z',
    answeredBy: 'Legal Team',
    answeredAt: '2024-01-17T09:15:00Z',
    visibility: 'all-bidders'
  },
  {
    id: '2',
    category: 'Financial',
    title: 'Working capital requirements',
    question: 'What are the typical working capital requirements and seasonal variations?',
    status: 'in-review',
    priority: 'medium',
    askedBy: 'Financial Investor Beta',
    askedAt: '2024-01-17T11:00:00Z',
    visibility: 'all-bidders'
  },
  {
    id: '3',
    category: 'Technical',
    title: 'IT infrastructure and systems',
    question: 'Please provide an overview of the current IT infrastructure, including any planned upgrades or known issues.',
    status: 'new',
    priority: 'low',
    askedBy: 'Strategic Investor Gamma',
    askedAt: '2024-01-17T15:45:00Z',
    visibility: 'all-bidders'
  }
];

// Users Mock Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@test-company.de',
    role: 'owner',
    organization: 'Test GmbH',
    status: 'active',
    lastLogin: '2024-01-17T16:30:00Z',
    joinedAt: '2024-01-01T09:00:00Z',
    accessLevel: ['Full Access', 'Admin Rights', 'User Management']
  },
  {
    id: '2',
    name: 'Dr. Mueller',
    email: 'mueller@insolvency-admin.de',
    role: 'insolvency-admin',
    organization: 'Insolvency Administration',
    status: 'active',
    lastLogin: '2024-01-17T08:15:00Z',
    joinedAt: '2024-01-02T10:00:00Z',
    accessLevel: ['Insolvency Documents', 'Process Management', 'Creditor Information']
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@ma-advisor.com',
    role: 'ma-advisor',
    organization: 'M&A Advisory Firm',
    status: 'active',
    lastLogin: '2024-01-17T14:20:00Z',
    joinedAt: '2024-01-03T11:30:00Z',
    accessLevel: ['Deal Documents', 'Financial Information', 'Q&A Management']
  },
  {
    id: '4',
    name: 'Michael Chen',
    email: 'michael.chen@strategic-alpha.com',
    role: 'bidder-lead',
    organization: 'Strategic Investor Alpha',
    status: 'active',
    lastLogin: '2024-01-17T13:45:00Z',
    joinedAt: '2024-01-05T14:00:00Z',
    accessLevel: ['Phase 2 Documents', 'Q&A Submission', 'Bid Submission']
  },
  {
    id: '5',
    name: 'Emma Wilson',
    email: 'emma.wilson@financial-beta.com',
    role: 'bidder-lead',
    organization: 'Financial Investor Beta',
    status: 'active',
    lastLogin: '2024-01-16T17:30:00Z',
    joinedAt: '2024-01-06T09:15:00Z',
    accessLevel: ['Phase 2 Documents', 'Q&A Submission', 'Bid Submission']
  },
  {
    id: '6',
    name: 'David Brown',
    email: 'david.brown@cleanteam.com',
    role: 'clean-team',
    organization: 'Clean Team Advisor',
    status: 'active',
    lastLogin: '2024-01-17T12:00:00Z',
    joinedAt: '2024-01-04T16:45:00Z',
    accessLevel: ['Clean Team Documents', 'Sensitive Information', 'Restricted Access']
  },
  {
    id: '7',
    name: 'Lisa Garcia',
    email: 'lisa.garcia@pending-bidder.com',
    role: 'bidder-member',
    organization: 'Pending Bidder Corp',
    status: 'pending',
    joinedAt: '2024-01-16T10:30:00Z',
    accessLevel: ['Basic Access']
  }
];

// Bids Mock Data
export const mockBids: Bid[] = [
  {
    id: '1',
    bidderName: 'Strategic Investor Alpha',
    bidderType: 'strategic',
    amount: 12500000,
    currency: 'EUR',
    phase: 'NBO',
    status: 'submitted',
    submittedAt: '2024-01-15T23:59:00Z',
    submittedBy: 'Michael Chen',
    conditions: ['Financing confirmed', 'Regulatory approval pending', 'Key employee retention'],
    attachments: ['proof-of-funds.pdf', 'financing-commitment.pdf']
  },
  {
    id: '2',
    bidderName: 'Financial Investor Beta',
    bidderType: 'financial',
    amount: 11800000,
    currency: 'EUR',
    phase: 'NBO',
    status: 'submitted',
    submittedAt: '2024-01-16T15:30:00Z',
    submittedBy: 'Emma Wilson',
    conditions: ['Fund approval pending', 'Due diligence completion'],
    attachments: ['fund-commitment.pdf']
  },
  {
    id: '3',
    bidderName: 'Management Buyout Team',
    bidderType: 'financial',
    amount: 9500000,
    currency: 'EUR',
    phase: 'NBO',
    status: 'draft',
    submittedAt: '2024-01-17T10:00:00Z',
    submittedBy: 'Management Team',
    conditions: ['Financing arrangement pending'],
    attachments: []
  }
];

// Timeline Mock Data
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '2024-01-01',
    time: '09:00',
    title: 'Process Launch',
    description: 'M&A process officially launched',
    type: 'milestone',
    status: 'completed',
    participants: ['Deal Team', 'Insolvency Administrator']
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '17:00',
    title: 'IOI Deadline',
    description: 'Initial offers submission deadline',
    type: 'bid',
    status: 'completed',
    participants: ['All Bidders']
  },
  {
    id: '3',
    date: '2024-02-01',
    time: '17:00',
    title: 'NBO Deadline',
    description: 'Non-binding offers submission deadline',
    type: 'bid',
    status: 'upcoming',
    participants: ['Shortlisted Bidders']
  },
  {
    id: '4',
    date: '2024-02-15',
    time: '14:00',
    title: 'Management Presentations',
    description: 'Presentations to shortlisted bidders',
    type: 'meeting',
    status: 'upcoming',
    participants: ['Management Team', 'Shortlisted Bidders']
  }
];

// Settings Mock Data
export const mockDealSettings: DealSettings = {
  dealName: 'Test GmbH - Asset Deal',
  dealType: 'Asset Deal',
  phase: 'NBO',
  timeline: {
    nboDeadline: '2024-02-01',
    finalBidDeadline: '2024-03-01',
    closingExpected: '2024-04-15'
  },
  access: {
    watermarkEnabled: true,
    downloadRestrictions: true,
    auditLogging: true
  },
  notifications: {
    emailAlerts: true,
    qaNotifications: true,
    bidNotifications: true
  }
};