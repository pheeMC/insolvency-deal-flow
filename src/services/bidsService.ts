import { apiClient } from './api';
import { ApiResponse, PaginatedResponse, Bid } from '../types/api';
import { mockBids } from './mockData';

export const bidsService = {
  // GET /bids
  async getBids(phase?: string, status?: string): Promise<Bid[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredBids = [...mockBids];
    
    if (phase) {
      filteredBids = filteredBids.filter(bid => bid.phase === phase);
    }
    
    if (status) {
      filteredBids = filteredBids.filter(bid => bid.status === status);
    }
    
    return filteredBids;
  },

  // GET /bids/:id
  async getBid(id: string): Promise<Bid> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bid = mockBids.find(b => b.id === id);
    if (!bid) {
      throw new Error('Bid not found');
    }
    return bid;
  },

  // POST /bids
  async createBid(bid: Omit<Bid, 'id' | 'submittedAt' | 'status'>): Promise<Bid> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newBid: Bid = {
      ...bid,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    mockBids.push(newBid);
    return newBid;
  },

  // PUT /bids/:id
  async updateBid(id: string, updates: Partial<Bid>): Promise<Bid> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const bidIndex = mockBids.findIndex(b => b.id === id);
    if (bidIndex === -1) {
      throw new Error('Bid not found');
    }
    
    mockBids[bidIndex] = { ...mockBids[bidIndex], ...updates };
    return mockBids[bidIndex];
  },

  // PUT /bids/:id/status
  async updateBidStatus(id: string, status: Bid['status']): Promise<Bid> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bidIndex = mockBids.findIndex(b => b.id === id);
    if (bidIndex === -1) {
      throw new Error('Bid not found');
    }
    
    mockBids[bidIndex] = { ...mockBids[bidIndex], status };
    return mockBids[bidIndex];
  },

  // DELETE /bids/:id
  async deleteBid(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bidIndex = mockBids.findIndex(b => b.id === id);
    if (bidIndex !== -1) {
      mockBids.splice(bidIndex, 1);
    }
  },

  // POST /bids/:id/attachments
  async uploadAttachment(id: string, file: File): Promise<string> {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const bid = mockBids.find(b => b.id === id);
    if (!bid) {
      throw new Error('Bid not found');
    }
    
    const fileName = file.name;
    if (!bid.attachments) {
      bid.attachments = [];
    }
    bid.attachments.push(fileName);
    
    return `/uploads/bids/${id}/${fileName}`;
  },

  // GET /bids/export
  async exportBids(format = 'excel'): Promise<Blob> {
    // Simulate export generation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    let exportContent = `Bids Export - ${new Date().toLocaleDateString()}\n\n`;
    
    mockBids.forEach((bid, index) => {
      exportContent += `Bid ${index + 1}:\n`;
      exportContent += `Bidder: ${bid.bidderName}\n`;
      exportContent += `Type: ${bid.bidderType}\n`;
      exportContent += `Amount: ${bid.currency} ${bid.amount.toLocaleString()}\n`;
      exportContent += `Phase: ${bid.phase}\n`;
      exportContent += `Status: ${bid.status}\n`;
      exportContent += `Submitted: ${new Date(bid.submittedAt).toLocaleString()}\n`;
      exportContent += `Submitted By: ${bid.submittedBy}\n`;
      if (bid.conditions && bid.conditions.length > 0) {
        exportContent += `Conditions: ${bid.conditions.join(', ')}\n`;
      }
      exportContent += `---\n\n`;
    });
    
    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/plain';
    return new Blob([exportContent], { type: mimeType });
  },
};