import { supabase } from '@/integrations/supabase/client';
import { QAThread, QAFilter, PaginatedResponse } from '../types/api';
import { showErrorToast } from '@/components/ui/toast-notifications';

export const supabaseQAService = {
  async getThreads(filter?: QAFilter, page = 1, limit = 20): Promise<PaginatedResponse<QAThread>> {
    let query = supabase.from('qa_threads').select('*', { count: 'exact' });
    
    // Apply filters
    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }
    
    if (filter?.category && filter.category !== 'all') {
      query = query.eq('category', filter.category);
    }
    
    if (filter?.priority && filter.priority !== 'all') {
      query = query.eq('priority', filter.priority);
    }
    
    if (filter?.search) {
      query = query.or(`title.ilike.%${filter.search}%,question.ilike.%${filter.search}%,answer.ilike.%${filter.search}%`);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);
    query = query.order('created_at', { ascending: false });
    
    const { data, count, error } = await query;
    
    if (error) {
      showErrorToast(`Failed to fetch Q&A threads: ${error.message}`);
      throw error;
    }
    
    const threads: QAThread[] = (data || []).map(thread => ({
      id: thread.id,
      title: thread.title,
      question: thread.question,
      answer: thread.answer,
      askedBy: thread.asked_by,
      askedAt: thread.created_at,
      answeredBy: thread.answered_by,
      answeredAt: thread.updated_at !== thread.created_at ? thread.updated_at : undefined,
      status: thread.status,
      category: thread.category,
      priority: thread.priority,
      visibility: thread.visibility,
      attachments: thread.attachments || []
    }));
    
    return {
      success: true,
      data: threads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  },

  async getThread(id: string): Promise<QAThread> {
    const { data, error } = await supabase
      .from('qa_threads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      showErrorToast(`Failed to fetch Q&A thread: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      question: data.question,
      answer: data.answer,
      askedBy: data.asked_by,
      askedAt: data.created_at,
      answeredBy: data.answered_by,
      answeredAt: data.updated_at !== data.created_at ? data.updated_at : undefined,
      status: data.status,
      category: data.category,
      priority: data.priority,
      visibility: data.visibility,
      attachments: data.attachments || []
    };
  },

  async createThread(thread: Omit<QAThread, 'id' | 'askedAt' | 'status'>): Promise<QAThread> {
    const { data, error } = await supabase
      .from('qa_threads')
      .insert({
        title: thread.title,
        question: thread.question,
        asked_by: thread.askedBy,
        category: thread.category,
        priority: thread.priority,
        visibility: thread.visibility,
        attachments: thread.attachments,
        status: 'new'
      })
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to create Q&A thread: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      question: data.question,
      answer: data.answer,
      askedBy: data.asked_by,
      askedAt: data.created_at,
      answeredBy: data.answered_by,
      answeredAt: data.updated_at !== data.created_at ? data.updated_at : undefined,
      status: data.status,
      category: data.category,
      priority: data.priority,
      visibility: data.visibility,
      attachments: data.attachments || []
    };
  },

  async updateThread(id: string, updates: Partial<QAThread>): Promise<QAThread> {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.question) updateData.question = updates.question;
    if (updates.answer) updateData.answer = updates.answer;
    if (updates.answeredBy) updateData.answered_by = updates.answeredBy;
    if (updates.status) updateData.status = updates.status;
    if (updates.category) updateData.category = updates.category;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.visibility) updateData.visibility = updates.visibility;
    if (updates.attachments) updateData.attachments = updates.attachments;
    
    const { data, error } = await supabase
      .from('qa_threads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update Q&A thread: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      question: data.question,
      answer: data.answer,
      askedBy: data.asked_by,
      askedAt: data.created_at,
      answeredBy: data.answered_by,
      answeredAt: data.updated_at !== data.created_at ? data.updated_at : undefined,
      status: data.status,
      category: data.category,
      priority: data.priority,
      visibility: data.visibility,
      attachments: data.attachments || []
    };
  },

  async answerThread(id: string, answer: string, publishTo: 'all-bidders' | 'specific-bidder' | 'draft' = 'draft'): Promise<QAThread> {
    const status = publishTo === 'draft' ? 'answered' : 'published';
    
    const { data, error } = await supabase
      .from('qa_threads')
      .update({
        answer,
        answered_by: 'Current User', // In real app, get from auth context
        status
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to answer Q&A thread: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      question: data.question,
      answer: data.answer,
      askedBy: data.asked_by,
      askedAt: data.created_at,
      answeredBy: data.answered_by,
      answeredAt: data.updated_at,
      status: data.status,
      category: data.category,
      priority: data.priority,
      visibility: data.visibility,
      attachments: data.attachments || []
    };
  },

  async updateStatus(id: string, status: QAThread['status']): Promise<QAThread> {
    const { data, error } = await supabase
      .from('qa_threads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update thread status: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      question: data.question,
      answer: data.answer,
      askedBy: data.asked_by,
      askedAt: data.created_at,
      answeredBy: data.answered_by,
      answeredAt: data.updated_at !== data.created_at ? data.updated_at : undefined,
      status: data.status,
      category: data.category,
      priority: data.priority,
      visibility: data.visibility,
      attachments: data.attachments || []
    };
  },

  async addInternalNote(id: string, note: string): Promise<void> {
    try {
      // Get current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get current user's profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (userProfile) {
          // Log internal note activity
          const { error } = await supabase
            .from('activity_logs')
            .insert({
              user_id: userProfile.id,
              action: 'Internal Note Added',
              resource_type: 'qa_thread',
              resource_id: id,
              details: { note }
            });
          
          if (error) {
            showErrorToast(`Failed to add internal note: ${error.message}`);
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to add internal note:', error);
      showErrorToast('Failed to add internal note');
    }
  },

  async getCategories(): Promise<string[]> {
    // Get unique categories from existing threads
    const { data, error } = await supabase
      .from('qa_threads')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      return ['Legal', 'Financial', 'Technical', 'Commercial', 'HR', 'Environmental', 'Regulatory'];
    }
    
    const categories = [...new Set((data || []).map(item => item.category))];
    return categories.length > 0 ? categories : ['Legal', 'Financial', 'Technical', 'Commercial', 'HR', 'Environmental', 'Regulatory'];
  },

  async deleteThread(id: string): Promise<void> {
    const { error } = await supabase
      .from('qa_threads')
      .delete()
      .eq('id', id);
    
    if (error) {
      showErrorToast(`Failed to delete Q&A thread: ${error.message}`);
      throw error;
    }
  },
};