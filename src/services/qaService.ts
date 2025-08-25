import { apiClient } from './api';
import { ApiResponse, PaginatedResponse, QAThread, QAFilter } from '../types/api';
import { mockQAThreads } from './mockData';

export const qaService = {
  // GET /qa/threads
  async getThreads(filter?: QAFilter, page = 1, limit = 20): Promise<PaginatedResponse<QAThread>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredThreads = [...mockQAThreads];
    
    // Apply filters
    if (filter?.status && filter.status !== 'all') {
      filteredThreads = filteredThreads.filter(thread => thread.status === filter.status);
    }
    
    if (filter?.category && filter.category !== 'all') {
      filteredThreads = filteredThreads.filter(thread => thread.category === filter.category);
    }
    
    if (filter?.priority && filter.priority !== 'all') {
      filteredThreads = filteredThreads.filter(thread => thread.priority === filter.priority);
    }
    
    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredThreads = filteredThreads.filter(thread => 
        thread.title.toLowerCase().includes(searchTerm) ||
        thread.question.toLowerCase().includes(searchTerm) ||
        (thread.answer && thread.answer.toLowerCase().includes(searchTerm))
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedThreads = filteredThreads.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedThreads,
      pagination: {
        page,
        limit,
        total: filteredThreads.length,
        totalPages: Math.ceil(filteredThreads.length / limit)
      }
    };
  },

  // GET /qa/threads/:id
  async getThread(id: string): Promise<QAThread> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const thread = mockQAThreads.find(t => t.id === id);
    if (!thread) {
      throw new Error('Q&A thread not found');
    }
    return thread;
  },

  // POST /qa/threads
  async createThread(thread: Omit<QAThread, 'id' | 'askedAt' | 'status'>): Promise<QAThread> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newThread: QAThread = {
      ...thread,
      id: Date.now().toString(),
      askedAt: new Date().toISOString(),
      status: 'new'
    };
    
    mockQAThreads.unshift(newThread);
    return newThread;
  },

  // PUT /qa/threads/:id
  async updateThread(id: string, updates: Partial<QAThread>): Promise<QAThread> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const threadIndex = mockQAThreads.findIndex(t => t.id === id);
    if (threadIndex === -1) {
      throw new Error('Q&A thread not found');
    }
    
    mockQAThreads[threadIndex] = { ...mockQAThreads[threadIndex], ...updates };
    return mockQAThreads[threadIndex];
  },

  // POST /qa/threads/:id/answer
  async answerThread(id: string, answer: string, publishTo: 'all-bidders' | 'specific-bidder' | 'draft' = 'draft'): Promise<QAThread> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const threadIndex = mockQAThreads.findIndex(t => t.id === id);
    if (threadIndex === -1) {
      throw new Error('Q&A thread not found');
    }
    
    const status = publishTo === 'draft' ? 'answered' : 'published';
    
    mockQAThreads[threadIndex] = {
      ...mockQAThreads[threadIndex],
      answer,
      answeredBy: 'Current User',
      answeredAt: new Date().toISOString(),
      status
    };
    
    return mockQAThreads[threadIndex];
  },

  // PUT /qa/threads/:id/status
  async updateStatus(id: string, status: QAThread['status']): Promise<QAThread> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const threadIndex = mockQAThreads.findIndex(t => t.id === id);
    if (threadIndex === -1) {
      throw new Error('Q&A thread not found');
    }
    
    mockQAThreads[threadIndex] = { ...mockQAThreads[threadIndex], status };
    return mockQAThreads[threadIndex];
  },

  // POST /qa/threads/:id/notes
  async addInternalNote(id: string, note: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // In a real implementation, this would add internal notes to the thread
    console.log(`Internal note added to thread ${id}: ${note}`);
  },

  // GET /qa/categories
  async getCategories(): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return ['Legal', 'Financial', 'Technical', 'Commercial', 'HR', 'Environmental', 'Regulatory'];
  },

  // DELETE /qa/threads/:id
  async deleteThread(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const threadIndex = mockQAThreads.findIndex(t => t.id === id);
    if (threadIndex !== -1) {
      mockQAThreads.splice(threadIndex, 1);
    }
  },
};