import { supabase } from '@/integrations/supabase/client';
import { User, UserFilter, PaginatedResponse } from '../types/api';
import { showErrorToast, showSuccessToast } from '@/components/ui/toast-notifications';

export const supabaseUsersService = {
  async getUsers(filter?: UserFilter, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    
    // Apply filters
    if (filter?.role && filter.role !== 'all') {
      query = query.eq('role', filter.role);
    }
    
    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }
    
    if (filter?.organization && filter.organization !== 'all') {
      query = query.eq('organization', filter.organization);
    }
    
    if (filter?.search) {
      query = query.or(`full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,organization.ilike.%${filter.search}%`);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);
    query = query.order('created_at', { ascending: false });
    
    const { data, count, error } = await query;
    
    if (error) {
      showErrorToast(`Failed to fetch users: ${error.message}`);
      throw error;
    }
    
    const users: User[] = (data || []).map(profile => ({
      id: profile.id,
      name: profile.full_name || 'Unknown',
      email: profile.email || '',
      role: profile.role as User['role'],
      organization: profile.organization || '',
      status: profile.status as User['status'],
      joinedAt: profile.created_at,
      lastLogin: profile.last_login,
      accessLevel: profile.access_level || []
    }));
    
    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  },

  async getUser(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      showErrorToast(`Failed to fetch user: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.full_name || 'Unknown',
      email: data.email || '',
      role: data.role as User['role'],
      organization: data.organization || '',
      status: data.status as User['status'],
      joinedAt: data.created_at,
      lastLogin: data.last_login,
      accessLevel: data.access_level || []
    };
  },

  async inviteUser(email: string, role: User['role'], organization: string, accessLevel: string[]): Promise<User> {
    // First, invite user through Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role,
        organization,
        access_level: accessLevel
      }
    });
    
    if (authError) {
      showErrorToast(`Failed to invite user: ${authError.message}`);
      throw authError;
    }
    
    // The profile will be created automatically by the trigger
    // Return a temporary user object
    const newUser: User = {
      id: authData.user?.id || Date.now().toString(),
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role,
      organization,
      status: 'pending',
      joinedAt: new Date().toISOString(),
      accessLevel
    };
    
    showSuccessToast('User invitation sent successfully');
    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const updateData: any = {};
    
    if (updates.name) updateData.full_name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.organization) updateData.organization = updates.organization;
    if (updates.status) updateData.status = updates.status;
    if (updates.accessLevel) updateData.access_level = updates.accessLevel;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update user: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.full_name || 'Unknown',
      email: data.email || '',
      role: data.role as User['role'],
      organization: data.organization || '',
      status: data.status as User['status'],
      joinedAt: data.created_at,
      lastLogin: data.last_login,
      accessLevel: data.access_level || []
    };
  },

  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update user status: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.full_name || 'Unknown',
      email: data.email || '',
      role: data.role as User['role'],
      organization: data.organization || '',
      status: data.status as User['status'],
      joinedAt: data.created_at,
      lastLogin: data.last_login,
      accessLevel: data.access_level || []
    };
  },

  async updateUserRole(id: string, role: User['role'], accessLevel: string[]): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, access_level: accessLevel })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      showErrorToast(`Failed to update user role: ${error.message}`);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.full_name || 'Unknown',
      email: data.email || '',
      role: data.role as User['role'],
      organization: data.organization || '',
      status: data.status as User['status'],
      joinedAt: data.created_at,
      lastLogin: data.last_login,
      accessLevel: data.access_level || []
    };
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      showErrorToast(`Failed to delete user: ${error.message}`);
      throw error;
    }
  },

  async getUserActivity(id: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      showErrorToast(`Failed to fetch user activity: ${error.message}`);
      return [];
    }
    
    return (data || []).map(log => ({
      id: log.id,
      action: log.action,
      timestamp: log.created_at,
      details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || ''
    }));
  },

  async sendMessage(id: string, subject: string, message: string): Promise<void> {
    try {
      // Get current user profile ID to use for activity log
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', id)
        .single();

      if (userProfile) {
        // Log the message action using profile ID
        await supabase
          .from('activity_logs')
          .insert({
            user_id: userProfile.id,
            action: 'Message Sent',
            resource_type: 'user',
            resource_id: id,
            details: { subject, message }
          });
      }
      
      console.log(`Message sent to user ${id}: ${subject}`);
    } catch (error: any) {
      console.error('Failed to log message:', error);
      // Don't throw error here to prevent blocking the message functionality
    }
  },

  async getRoles(): Promise<string[]> {
    return [
      'owner',
      'insolvency-admin',
      'ma-advisor',
      'deal-admin',
      'bidder-lead',
      'bidder-member',
      'clean-team',
      'viewer'
    ];
  },

  async getOrganizations(): Promise<string[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('organization')
      .not('organization', 'is', null);
    
    if (error) {
      return [];
    }
    
    const organizations = [...new Set((data || []).map(item => item.organization))];
    return organizations.filter(Boolean);
  },
};