import { useState } from 'react';
import { Document } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Eye,
  Lock,
  Calendar,
  User,
  FileSpreadsheet,
  FileImage,
  X,
} from 'lucide-react';

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onDownload: (documentId: string) => void;
}

export function DocumentViewer({ document, onClose, onDownload }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return FileText;
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return FileSpreadsheet;
    if (name.endsWith('.jpg') || name.endsWith('.png')) return FileImage;
    return FileText;
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

  const FileIcon = getFileIcon(document.name);

  return (
    <Card className="vdr-document-viewer">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileIcon className="h-5 w-5 text-primary" />
          {document.name}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Preview */}
        <div className="aspect-[3/4] bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
          <div className="text-center">
            <FileIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Document Preview</p>
            <p className="text-xs text-muted-foreground">
              {document.name.endsWith('.pdf') ? 'PDF Document' : 
               document.name.endsWith('.xlsx') || document.name.endsWith('.xls') ? 'Spreadsheet' :
               document.name.endsWith('.jpg') || document.name.endsWith('.png') ? 'Image' :
               'Document'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Document Metadata */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Access Level</span>
            <Badge variant={getAccessBadgeVariant(document.access)}>
              {getAccessLabel(document.access)}
            </Badge>
          </div>

          {document.size && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Size</span>
              <span className="text-sm text-muted-foreground">{document.size}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Modified</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(document.modified).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Modified By</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              {document.modifiedBy}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Watermark</span>
            <div className="flex items-center gap-1">
              {document.watermark && <Lock className="h-3 w-3 text-muted-foreground" />}
              <span className="text-sm text-muted-foreground">
                {document.watermark ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 gap-2"
            onClick={() => onDownload(document.id)}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Eye className="h-4 w-4" />
            View Full
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}