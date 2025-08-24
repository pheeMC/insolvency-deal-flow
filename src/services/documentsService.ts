import { apiClient } from './api';
import { ApiResponse, Document, DocumentUpload } from '../types/api';

export const documentsService = {
  // GET /documents
  async getDocuments(folderId?: string): Promise<Document[]> {
    const endpoint = folderId ? `/documents?folder=${folderId}` : '/documents';
    const response = await apiClient.get<ApiResponse<Document[]>>(endpoint);
    return response.data;
  },

  // GET /documents/:id
  async getDocument(id: string): Promise<Document> {
    const response = await apiClient.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data;
  },

  // POST /documents/upload
  async uploadDocument(upload: DocumentUpload): Promise<Document> {
    const formData = new FormData();
    formData.append('file', upload.file);
    formData.append('name', upload.name);
    formData.append('access', upload.access);
    formData.append('watermark', String(upload.watermark));
    if (upload.folderId) {
      formData.append('folderId', upload.folderId);
    }

    const response = await apiClient.uploadFile<ApiResponse<Document>>('/documents/upload', formData);
    return response.data;
  },

  // POST /documents/folder
  async createFolder(name: string, parentId?: string, access: Document['access'] = 'full'): Promise<Document> {
    const response = await apiClient.post<ApiResponse<Document>>('/documents/folder', {
      name,
      parentId,
      access,
    });
    return response.data;
  },

  // PUT /documents/:id
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const response = await apiClient.put<ApiResponse<Document>>(`/documents/${id}`, updates);
    return response.data;
  },

  // DELETE /documents/:id
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },

  // GET /documents/:id/download
  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    return response.blob();
  },

  // POST /documents/bulk-download
  async bulkDownload(documentIds: string[]): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/documents/bulk-download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ documentIds }),
    });
    return response.blob();
  },

  // GET /documents/search
  async searchDocuments(query: string): Promise<Document[]> {
    const response = await apiClient.get<ApiResponse<Document[]>>(`/documents/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};