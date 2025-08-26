import { supabase } from '@/integrations/supabase/client';
import { Bid } from '../types/api';
import { showErrorToast } from '@/components/ui/toast-notifications';

export const supabaseBidsService = {
  async getBids(phase?: string, status?: string): Promise<Bid[]> {
    let query = supabase.from('bids').select('*');
    
    if (phase) {
      query = query.eq('phase', phase);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      showErrorToast(`Failed to fetch bids: ${error.message}`);
      throw error;
    }
    
    return (data || []).map(bid => ({
      id: bid.id,
      bidderName: bid.bidder_name,
      bidderType: bid.bidder_type || 'Strategic',
      amount: bid.amount || 0,
      currency: bid.currency || 'EUR',
      phase: bid.phase || 'IOI',
      status: bid.status || 'draft',
      submittedBy: bid.submitted_by || 'Unknown',
      submittedAt: bid.created_at,
      conditions: bid.conditions || [],
      attachments: bid.attachments || []
    }));
  },

  async getBid(id: string): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      showErrorToast(`Failed to fetch bid: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      bidderName: data.bidder_name,
      bidderType: data.bidder_type || 'Strategic',
      amount: data.amount || 0,
      currency: data.currency || 'EUR',
      phase: data.phase || 'IOI',
      status: data.status || 'draft',
      submittedBy: data.submitted_by || 'Unknown',
      submittedAt: data.created_at,
      conditions: data.conditions || [],
      attachments: data.attachments || []
    };
  },

  async createBid(bid: Omit<Bid, 'id' | 'submittedAt' | 'status'>): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .insert({
        bidder_name: bid.bidderName,
        bidder_type: bid.bidderType,
        amount: bid.amount,
        currency: bid.currency,
        phase: bid.phase,
        submitted_by: bid.submittedBy,
        conditions: bid.conditions,
        attachments: bid.attachments,
        status: 'draft'
      })
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to create bid: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      bidderName: data.bidder_name,
      bidderType: data.bidder_type || 'Strategic',
      amount: data.amount || 0,
      currency: data.currency || 'EUR',
      phase: data.phase || 'IOI',
      status: data.status || 'draft',
      submittedBy: data.submitted_by || 'Unknown',
      submittedAt: data.created_at,
      conditions: data.conditions || [],
      attachments: data.attachments || []
    };
  },

  async updateBid(id: string, updates: Partial<Bid>): Promise<Bid> {
    const updateData: any = {};
    
    if (updates.bidderName) updateData.bidder_name = updates.bidderName;
    if (updates.bidderType) updateData.bidder_type = updates.bidderType;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.currency) updateData.currency = updates.currency;
    if (updates.phase) updateData.phase = updates.phase;
    if (updates.status) updateData.status = updates.status;
    if (updates.submittedBy) updateData.submitted_by = updates.submittedBy;
    if (updates.conditions) updateData.conditions = updates.conditions;
    if (updates.attachments) updateData.attachments = updates.attachments;
    
    const { data, error } = await supabase
      .from('bids')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update bid: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      bidderName: data.bidder_name,
      bidderType: data.bidder_type || 'Strategic',
      amount: data.amount || 0,
      currency: data.currency || 'EUR',
      phase: data.phase || 'IOI',
      status: data.status || 'draft',
      submittedBy: data.submitted_by || 'Unknown',
      submittedAt: data.created_at,
      conditions: data.conditions || [],
      attachments: data.attachments || []
    };
  },

  async updateBidStatus(id: string, status: Bid['status']): Promise<Bid> {
    const { data, error } = await supabase
      .from('bids')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update bid status: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      bidderName: data.bidder_name,
      bidderType: data.bidder_type || 'Strategic',
      amount: data.amount || 0,
      currency: data.currency || 'EUR',
      phase: data.phase || 'IOI',
      status: data.status || 'draft',
      submittedBy: data.submitted_by || 'Unknown',
      submittedAt: data.created_at,
      conditions: data.conditions || [],
      attachments: data.attachments || []
    };
  },

  async deleteBid(id: string): Promise<void> {
    const { error } = await supabase
      .from('bids')
      .delete()
      .eq('id', id);
    
    if (error) {
      showErrorToast(`Failed to delete bid: ${error.message}`);
      throw error;
    }
  },

  async uploadAttachment(id: string, file: File): Promise<string> {
    // Upload file to storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `bids/${id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
    
    if (uploadError) {
      showErrorToast(`Failed to upload attachment: ${uploadError.message}`);
      throw uploadError;
    }
    
    // Update bid with new attachment
    const { data: bid, error: fetchError } = await supabase
      .from('bids')
      .select('attachments')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    const attachments = bid.attachments || [];
    attachments.push(fileName);
    
    const { error: updateError } = await supabase
      .from('bids')
      .update({ attachments })
      .eq('id', id);
    
    if (updateError) {
      throw updateError;
    }
    
    return filePath;
  },

  async exportBids(format = 'excel'): Promise<Blob> {
    const { data: bids, error } = await supabase
      .from('bids')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      showErrorToast(`Failed to fetch bids for export: ${error.message}`);
      throw error;
    }
    
    let exportContent = `Bids Export - ${new Date().toLocaleDateString()}\n\n`;
    
    (bids || []).forEach((bid, index) => {
      exportContent += `Bid ${index + 1}:\n`;
      exportContent += `Bidder: ${bid.bidder_name}\n`;
      exportContent += `Type: ${bid.bidder_type || 'N/A'}\n`;
      exportContent += `Amount: ${bid.currency} ${bid.amount?.toLocaleString() || 'N/A'}\n`;
      exportContent += `Phase: ${bid.phase}\n`;
      exportContent += `Status: ${bid.status}\n`;
      exportContent += `Submitted: ${new Date(bid.created_at).toLocaleString()}\n`;
      exportContent += `Submitted By: ${bid.submitted_by || 'N/A'}\n`;
      if (bid.conditions && bid.conditions.length > 0) {
        exportContent += `Conditions: ${bid.conditions.join(', ')}\n`;
      }
      exportContent += `---\n\n`;
    });
    
    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/plain';
    return new Blob([exportContent], { type: mimeType });
  },
};