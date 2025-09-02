import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsService } from '@/services/supabaseDocumentsService';
import { Document } from '@/types/api';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';
import { DocumentUploadModal } from '@/components/modals/DocumentUploadModal';
import { FolderModal } from '@/components/modals/FolderModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  FileSpreadsheet,
  FileImage,
  ArrowLeft,
  Grid3X3,
  List,
  Activity,
  Edit,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Documents() {
  const { folder } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['00', '01']);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Document | null>(null);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentsService.getDocuments(folder);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [folder]);

  const isInFolder = !!folder;
  const currentFolder = documents.find(f => f.id === folder);
  
  const displayDocuments = isInFolder 
    ? currentFolder?.children || []
    : documents;

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
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDownload(doc.id)}>
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

  const handleFolderClick = (folderId: string) => {
    navigate(`/documents/${folderId}`);
  };

  const handleBackClick = () => {
    navigate('/documents');
  };

  const getFileIcon = (type: string, name: string) => {
    if (type === 'folder') return FolderOpen;
    if (name.endsWith('.pdf')) return FileText;
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return FileSpreadsheet;
    if (name.endsWith('.jpg') || name.endsWith('.png')) return FileImage;
    return FileText;
  };

  const handleDownload = async (documentId: string) => {
    try {
      const toastId = showLoadingToast('Preparing download...');
      const blob = await documentsService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedDocument?.name || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      showSuccessToast('Document downloaded successfully');
    } catch (error) {
      console.error('Failed to download document:', error);
      showErrorToast('Failed to download document');
    }
  };

  const handleBulkDownload = async () => {
    try {
      const toastId = showLoadingToast('Preparing bulk download...');
      const documentIds = documents.map(doc => doc.id);
      const blob = await documentsService.bulkDownload(documentIds);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documents.zip';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      showSuccessToast('Bulk download completed');
    } catch (error) {
      console.error('Failed to bulk download:', error);
      showErrorToast('Failed to prepare bulk download');
    }
  };

  const handleUploadComplete = (document: Document) => {
    // Refresh documents list
    const fetchDocuments = async () => {
      try {
        const docs = await documentsService.getDocuments(folder);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to refresh documents:', error);
      }
    };
    fetchDocuments();
  };

  const handleFolderCreated = (newFolder: Document) => {
    if (editingFolder) {
      setDocuments(prev => prev.map(doc => doc.id === newFolder.id ? newFolder : doc));
      setEditingFolder(null);
    } else {
      setDocuments(prev => [newFolder, ...prev]);
    }
  };

  const handleEditFolder = (doc: Document) => {
    setEditingFolder(doc);
    setFolderModalOpen(true);
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const toastId = showLoadingToast('Deleting...');
      await documentsService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
      toast.dismiss(toastId);
      showSuccessToast('Document deleted successfully');
    } catch (error) {
      console.error('Failed to delete document:', error);
      showErrorToast('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isInFolder && (
            <Button variant="ghost" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Folders
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {isInFolder ? currentFolder?.name || 'Documents' : 'Document Repository'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isInFolder 
                ? 'Secure document access with watermarking and audit trails'
                : 'Secure access to deal documentation with watermarking and access controls'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleBulkDownload}>
            <Download className="h-4 w-4" />
            Bulk Download
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setFolderModalOpen(true)}>
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
          <Button className="gap-2" onClick={() => setUploadModalOpen(true)}>
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
                  {documents.map(doc => renderDocument(doc))}
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
                  <Button variant="outline" className="w-full gap-2" onClick={() => selectedDocument && handleDownload(selectedDocument.id)}>
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

      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        folderId={folder}
        onUploadComplete={handleUploadComplete}
      />

      <FolderModal
        open={folderModalOpen}
        onOpenChange={(open) => {
          setFolderModalOpen(open);
          if (!open) {
            setEditingFolder(null);
          }
        }}
        onFolderCreated={handleFolderCreated}
        parentId={folder}
        folder={editingFolder}
      />
    </div>
  );
}