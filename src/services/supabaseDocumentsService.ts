import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentUpload } from '@/types/api';

export const documentsService = {
  async getDocuments(folderId?: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('parent_id', folderId || null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type as 'file' | 'folder',
      size: doc.size || undefined,
      modified: doc.updated_at,
      modifiedBy: doc.uploaded_by || 'Unknown',
      access: doc.access_level as 'full' | 'restricted' | 'clean-team',
      watermark: doc.watermark || true,
      parentId: doc.parent_id || undefined,
    }));
  },

  async getDocument(id: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type as 'file' | 'folder',
      size: data.size || undefined,
      modified: data.updated_at,
      modifiedBy: data.uploaded_by || 'Unknown',
      access: data.access_level as 'full' | 'restricted' | 'clean-team',
      watermark: data.watermark || true,
      parentId: data.parent_id || undefined,
    };
  },

  async uploadDocument(upload: DocumentUpload): Promise<Document> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Upload file to storage
    const fileExt = upload.file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(fileName, upload.file);

    if (storageError) throw storageError;

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        name: upload.name,
        type: 'file',
        file_path: storageData.path,
        size: `${(upload.file.size / 1024 / 1024).toFixed(1)} MB`,
        access_level: upload.access,
        watermark: upload.watermark,
        parent_id: upload.folderId || null,
        uploaded_by: user.user.email,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type as 'file' | 'folder',
      size: data.size || undefined,
      modified: data.updated_at,
      modifiedBy: data.uploaded_by || 'Unknown',
      access: data.access_level as 'full' | 'restricted' | 'clean-team',
      watermark: data.watermark || true,
      parentId: data.parent_id || undefined,
    };
  },

  async createFolder(name: string, parentId?: string, access: Document['access'] = 'full'): Promise<Document> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .insert({
        name,
        type: 'folder',
        access_level: access,
        watermark: true,
        parent_id: parentId || null,
        uploaded_by: user.user.email,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type as 'file' | 'folder',
      modified: data.updated_at,
      modifiedBy: data.uploaded_by || 'Unknown',
      access: data.access_level as 'full' | 'restricted' | 'clean-team',
      watermark: data.watermark || true,
      parentId: data.parent_id || undefined,
      children: [],
    };
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        name: updates.name,
        access_level: updates.access,
        watermark: updates.watermark,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type as 'file' | 'folder',
      size: data.size || undefined,
      modified: data.updated_at,
      modifiedBy: data.uploaded_by || 'Unknown',
      access: data.access_level as 'full' | 'restricted' | 'clean-team',
      watermark: data.watermark || true,
      parentId: data.parent_id || undefined,
    };
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async downloadDocument(id: string): Promise<Blob> {
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('file_path, name')
      .eq('id', id)
      .single();

    if (docError) throw docError;

    if (!doc.file_path) {
      throw new Error('Document has no file path');
    }

    const { data, error } = await supabase.storage
      .from('documents')
      .download(doc.file_path);

    if (error) throw error;

    return data;
  },

  async bulkDownload(documentIds: string[]): Promise<Blob> {
    // For now, create a text file with document list
    // In production, you'd create a proper zip file
    let content = `Bulk Download - ${new Date().toLocaleString()}\n\n`;
    
    for (const id of documentIds) {
      try {
        const doc = await this.getDocument(id);
        content += `File: ${doc.name}\n`;
        content += `Size: ${doc.size || 'N/A'}\n`;
        content += `Modified: ${doc.modified}\n`;
        content += `Access Level: ${doc.access}\n`;
        content += `---\n\n`;
      } catch (error) {
        content += `Error loading document ${id}\n\n`;
      }
    }
    
    return new Blob([content], { type: 'text/plain' });
  },

  async searchDocuments(query: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type as 'file' | 'folder',
      size: doc.size || undefined,
      modified: doc.updated_at,
      modifiedBy: doc.uploaded_by || 'Unknown',
      access: doc.access_level as 'full' | 'restricted' | 'clean-team',
      watermark: doc.watermark || true,
      parentId: doc.parent_id || undefined,
    }));
  },
};