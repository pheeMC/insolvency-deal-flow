import { apiClient } from './api';
import { ApiResponse, TimelineEvent } from '../types/api';
import { mockTimelineEvents } from './mockData';

export const timelineService = {
  // GET /timeline/events
  async getEvents(startDate?: string, endDate?: string): Promise<TimelineEvent[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filteredEvents = [...mockTimelineEvents];
    
    if (startDate) {
      filteredEvents = filteredEvents.filter(event => event.date >= startDate);
    }
    
    if (endDate) {
      filteredEvents = filteredEvents.filter(event => event.date <= endDate);
    }
    
    return filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // GET /timeline/events/:id
  async getEvent(id: string): Promise<TimelineEvent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const event = mockTimelineEvents.find(e => e.id === id);
    if (!event) {
      throw new Error('Timeline event not found');
    }
    return event;
  },

  // POST /timeline/events
  async createEvent(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newEvent: TimelineEvent = {
      ...event,
      id: Date.now().toString()
    };
    
    mockTimelineEvents.push(newEvent);
    return newEvent;
  },

  // PUT /timeline/events/:id
  async updateEvent(id: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const eventIndex = mockTimelineEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Timeline event not found');
    }
    
    mockTimelineEvents[eventIndex] = { ...mockTimelineEvents[eventIndex], ...updates };
    return mockTimelineEvents[eventIndex];
  },

  // DELETE /timeline/events/:id
  async deleteEvent(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const eventIndex = mockTimelineEvents.findIndex(e => e.id === id);
    if (eventIndex !== -1) {
      mockTimelineEvents.splice(eventIndex, 1);
    }
  },

  // GET /timeline/milestones
  async getMilestones(): Promise<TimelineEvent[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockTimelineEvents.filter(event => event.type === 'milestone');
  },
};