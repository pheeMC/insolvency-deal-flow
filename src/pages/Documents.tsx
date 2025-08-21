import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FolderOpen,
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Lock,
  Users,
  Calendar,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  modifiedBy: string;
  access: 'full' | 'restricted' | 'clean-team';
  watermark: boolean;
  children?: Document[];
}

const documentStructure: Document[] = [
  {
    id: '00',
    name: '00_Admin',
    type: 'folder',
    modified: '2024-01-15',
    modifiedBy: 'Deal Admin',
    access: 'restricted',
    watermark: true,
    children: [
      {
        id: '00-01',
        name: 'NDA_Template.pdf',
        type: 'file',
        size: '245 KB',
        modified: '2024-01-15',
        modifiedBy: 'Legal Counsel',
        access: 'full',
        watermark: true,
      },
      {
        id: '00-02',
        name: 'Deal_Overview_Presentation.pdf',
        type: 'file',
        size: '2.1 MB',
        modified: '2024-01-14',
        modifiedBy: 'M&A Advisor',
        access: 'full',
        watermark: true,
      },
    ],
  },
  {
    id: '01',
    name: '01_Corporate',
    type: 'folder',
    modified: '2024-01-12',
    modifiedBy: 'Corporate Secretary',
    access: 'full',
    watermark: true,
    children: [
      {
        id: '01-01',
        name: 'Articles_of_Incorporation.pdf',
        type: 'file',
        size: '1.2 MB',
        modified: '2024-01-12',
        modifiedBy: 'Corporate Secretary',
        access: 'full',
        watermark: true,
      },
      {
        id: '01-02',
        name: 'Board_Resolutions_2023.pdf',
        type: 'file',
        size: '856 KB',
        modified: '2024-01-10',
        modifiedBy: 'Corporate Secretary',
        access: 'full',
        watermark: true,
      },
    ],
  },
  {
    id: '02',
    name: '02_Financials',
    type: 'folder',
    modified: '2024-01-16',
    modifiedBy: 'CFO Office',
    access: 'full',
    watermark: true,
    children: [
      {
        id: '02-01',
        name: 'Audited_Financial_Statements_2023.pdf',
        type: 'file',
        size: '3.4 MB',
        modified: '2024-01-16',
        modifiedBy: 'External Auditor',
        access: 'full',
        watermark: true,
      },
      {
        id: '02-02',
        name: 'Management_Accounts_Q3_2024.xlsx',
        type: 'file',
        size: '1.8 MB',
        modified: '2024-01-15',
        modifiedBy: 'Finance Director',
        access: 'full',
        watermark: true,
      },
    ],
  },
  {
    id: '05',
    name: '05_HR',
    type: 'folder',
    modified: '2024-01-11',
    modifiedBy: 'HR Director',
    access: 'clean-team',
    watermark: true,
    children: [
      {
        id: '05-01',
        name: 'Employee_List_Anonymized.xlsx',
        type: 'file',
        size: '892 KB',
        modified: '2024-01-11',
        modifiedBy: 'HR Director',
        access: 'clean-team',
        watermark: true,
      },
    ],
  },
  {
    id: '90',
    name: '90_InsO',
    type: 'folder',
    modified: '2024-01-17',
    modifiedBy: 'Insolvency Administrator',
    access: 'restricted',
    watermark: true,
    children: [
      {
        id: '90-01',
        name: 'Insolvency_Report_2024.pdf',
        type: 'file',
        size: '4.2 MB',
        modified: '2024-01-17',
        modifiedBy: 'Insolvency Administrator',
        access: 'restricted',
        watermark: true,
      },
      {
        id: '90-02',
        name: 'Asset_Valuation_Report.pdf',
        type: 'file',
        size: '2.8 MB',
        modified: '2024-01-16',
        modifiedBy: 'Valuation Expert',
        access: 'restricted',
        watermark: true,
      },
    ],
  },
];

export default function Documents() {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['00', '01']);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const getAccessBadgeVariant = (access: Document['access']) => {
    switch (access) {
      case 'full':
        return 'default';
      case 'restricted':
        return 'secondary';
      case 'clean-team':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getAccessLabel = (access: Document['access']) => {
    switch (access) {
      case 'full':
        return 'Full Access';
      case 'restricted':
        return 'Restricted';
      case 'clean-team':
        return 'Clean Team Only';
      default:
        return 'Unknown';
    }
  };

  const renderDocument = (doc: Document, level = 0) => {
    const isFolder = doc.type === 'folder';
    const isExpanded = expandedFolders.includes(doc.id);
    const paddingLeft = level * 1.5;

    return (
      <div key={doc.id}>
        <div
          className={`
            flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer
            border-l-2 border-transparent hover:border-primary/20
            ${selectedDocument?.id === doc.id ? 'bg-primary/5 border-primary/50' : ''}
          `}
          style={{ paddingLeft: `${paddingLeft + 0.75}rem` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(doc.id);
            } else {
              setSelectedDocument(doc);
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            {isFolder ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{doc.name}</span>
            {!isFolder && doc.size && (
              <span className="text-xs text-muted-foreground">({doc.size})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getAccessBadgeVariant(doc.access)} className="text-xs">
              {getAccessLabel(doc.access)}
            </Badge>
            {doc.watermark && <Lock className="h-3 w-3 text-muted-foreground" />}
            {!isFolder && (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {isFolder && isExpanded && doc.children?.map(child =>
          renderDocument(child, level + 1)
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Repository</h1>
          <p className="text-muted-foreground mt-2">
            Secure access to deal documentation with watermarking and access controls
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Folder Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {documentStructure.map(doc => renderDocument(doc))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Details */}
        <div>
          {selectedDocument ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{selectedDocument.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{selectedDocument.size || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified:</span>
                      <span>{selectedDocument.modified}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified by:</span>
                      <span>{selectedDocument.modifiedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Access:</span>
                      <Badge variant={getAccessBadgeVariant(selectedDocument.access)} className="text-xs">
                        {getAccessLabel(selectedDocument.access)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full gap-2">
                    <Eye className="h-4 w-4" />
                    View Document
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 text-sm">Security Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Lock className="h-3 w-3" />
                      <span>Watermarked</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="h-3 w-3" />
                      <span>Access Controlled</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>Audit Logged</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a document to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}