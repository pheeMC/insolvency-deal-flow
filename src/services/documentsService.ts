import { apiClient } from './api';
import { ApiResponse, Document, DocumentUpload } from '../types/api';
import { mockDocuments } from './mockData';

export const documentsService = {
  // GET /documents
  async getDocuments(folderId?: string): Promise<Document[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (folderId) {
      const folder = this.findDocumentById(mockDocuments, folderId);
      return folder?.children || [];
    }
    
    return mockDocuments;
  },

  // Helper function to find document by ID
  findDocumentById(documents: Document[], id: string): Document | null {
    for (const doc of documents) {
      if (doc.id === id) return doc;
      if (doc.children) {
        const found = this.findDocumentById(doc.children, id);
        if (found) return found;
      }
    }
    return null;
  },

  // GET /documents/:id
  async getDocument(id: string): Promise<Document> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const document = this.findDocumentById(mockDocuments, id);
    if (!document) {
      throw new Error('Document not found');
    }
    return document;
  },

  // POST /documents/upload
  async uploadDocument(upload: DocumentUpload): Promise<Document> {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newDocument: Document = {
      id: Date.now().toString(),
      name: upload.name,
      type: 'file',
      size: `${(upload.file.size / 1024 / 1024).toFixed(1)} MB`,
      modified: new Date().toISOString(),
      modifiedBy: 'Current User',
      access: upload.access,
      watermark: upload.watermark,
      parentId: upload.folderId
    };
    
    // Add to mock data
    if (upload.folderId) {
      const folder = this.findDocumentById(mockDocuments, upload.folderId);
      if (folder && folder.children) {
        folder.children.push(newDocument);
      }
    } else {
      mockDocuments.push(newDocument);
    }
    
    return newDocument;
  },

  // POST /documents/folder
  async createFolder(name: string, parentId?: string, access: Document['access'] = 'full'): Promise<Document> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newFolder: Document = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      modified: new Date().toISOString(),
      modifiedBy: 'Current User',
      access,
      watermark: true,
      parentId,
      children: []
    };
    
    // Add to mock data
    if (parentId) {
      const folder = this.findDocumentById(mockDocuments, parentId);
      if (folder && folder.children) {
        folder.children.push(newFolder);
      }
    } else {
      mockDocuments.push(newFolder);
    }
    
    return newFolder;
  },

  // PUT /documents/:id
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const document = this.findDocumentById(mockDocuments, id);
    if (!document) {
      throw new Error('Document not found');
    }
    
    Object.assign(document, updates, {
      modified: new Date().toISOString(),
      modifiedBy: 'Current User'
    });
    
    return document;
  },

  // DELETE /documents/:id
  async deleteDocument(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove from mock data (simplified implementation)
    const removeFromArray = (docs: Document[]): boolean => {
      const index = docs.findIndex(doc => doc.id === id);
      if (index !== -1) {
        docs.splice(index, 1);
        return true;
      }
      
      for (const doc of docs) {
        if (doc.children && removeFromArray(doc.children)) {
          return true;
        }
      }
      return false;
    };
    
    removeFromArray(mockDocuments);
  },

  // GET /documents/:id/download
  async downloadDocument(id: string): Promise<Blob> {
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const document = this.findDocumentById(mockDocuments, id);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Create a mock file content with watermark
    const content = `CONFIDENTIAL - ${document.name}

This document is part of the Test GmbH M&A process.
Downloaded by: Current User
Downloaded at: ${new Date().toLocaleString()}

WATERMARK: This document contains confidential information and is subject to the terms of the NDA.

[Document content would be here...]`;
    
    return new Blob([content], { type: 'text/plain' });
  },

  // POST /documents/bulk-download
  async bulkDownload(documentIds: string[]): Promise<Blob> {
    // Simulate bulk download
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let zipContent = `Bulk Download Archive - ${new Date().toLocaleString()}\n\n`;
    
    for (const id of documentIds) {
      const document = this.findDocumentById(mockDocuments, id);
      if (document) {
        zipContent += `File: ${document.name}\n`;
        zipContent += `Size: ${document.size || 'N/A'}\n`;
        zipContent += `Modified: ${document.modified}\n`;
        zipContent += `Access Level: ${document.access}\n`;
        zipContent += `---\n\n`;
      }
    }
    
    return new Blob([zipContent], { type: 'text/plain' });
  },

  // GET /documents/search
  async searchDocuments(query: string): Promise<Document[]> {
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const searchResults: Document[] = [];
    const searchInDocuments = (docs: Document[]) => {
      for (const doc of docs) {
        if (doc.name.toLowerCase().includes(query.toLowerCase())) {
          searchResults.push(doc);
        }
        if (doc.children) {
          searchInDocuments(doc.children);
        }
      }
    };
    
    searchInDocuments(mockDocuments);
    return searchResults;
  },
};