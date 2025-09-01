import { supabase } from '@/integrations/supabase/client';
import { TimelineEvent } from '../types/api';
import { showErrorToast } from '@/components/ui/toast-notifications';

export const supabaseTimelineService = {
  async getEvents(startDate?: string, endDate?: string): Promise<TimelineEvent[]> {
    let query = supabase.from('timeline_events').select('*');
    
    if (startDate) {
      query = query.gte('event_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('event_date', endDate);
    }
    
    const { data, error } = await query.order('event_date', { ascending: true });
    
    if (error) {
      showErrorToast(`Failed to fetch timeline events: ${error.message}`);
      throw error;
    }
    
    return (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.event_date,
      time: event.event_time,
      type: event.type as TimelineEvent['type'],
      status: event.status as TimelineEvent['status'],
      participants: event.participants || []
    }));
  },

  async getEvent(id: string): Promise<TimelineEvent> {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      showErrorToast(`Failed to fetch timeline event: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.event_date,
      time: data.event_time,
      type: data.type as TimelineEvent['type'],
      status: data.status as TimelineEvent['status'],
      participants: data.participants || []
    };
  },

  async createEvent(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const { data, error } = await supabase
      .from('timeline_events')
      .insert({
        title: event.title,
        description: event.description,
        event_date: event.date,
        event_time: event.time,
        type: event.type,
        status: event.status || 'upcoming',
        participants: event.participants
      })
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to create timeline event: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.event_date,
      time: data.event_time,
      type: data.type as TimelineEvent['type'],
      status: data.status as TimelineEvent['status'],
      participants: data.participants || []
    };
  },

  async updateEvent(id: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.date) updateData.event_date = updates.date;
    if (updates.time !== undefined) updateData.event_time = updates.time;
    if (updates.type) updateData.type = updates.type;
    if (updates.status) updateData.status = updates.status;
    if (updates.participants) updateData.participants = updates.participants;
    
    const { data, error } = await supabase
      .from('timeline_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update timeline event: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.event_date,
      time: data.event_time,
      type: data.type as TimelineEvent['type'],
      status: data.status as TimelineEvent['status'],
      participants: data.participants || []
    };
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id);
    
    if (error) {
      showErrorToast(`Failed to delete timeline event: ${error.message}`);
      throw error;
    }
  },

  async getMilestones(): Promise<TimelineEvent[]> {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('type', 'milestone')
      .order('event_date', { ascending: true });
    
    if (error) {
      showErrorToast(`Failed to fetch milestones: ${error.message}`);
      throw error;
    }
    
    return (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.event_date,
      time: event.event_time,
      type: event.type as TimelineEvent['type'],
      status: event.status as TimelineEvent['status'],
      participants: event.participants || []
    }));
  },
};