import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  const url = 'https://gnztbtpkobmiqwjkryhz.supabase.co';
  return url;
}

function getSupabaseAnonKey(): string {
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduenRidHBrb2JtaXF3amtyeWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTYyNzgsImV4cCI6MjA2OTAzMjI3OH0.aIXLe_OXwNxAiQzlw0JniI5eUIYqIc9-McaznSevD3g';
  return key;
}

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseInstance() {
  if (!supabaseInstance) {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  
  return supabaseInstance;
}

export const supabase = getSupabaseInstance();

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
          company_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          subscription_status: 'active' | 'canceled' | 'past_due';
          max_projects: number;
          max_crew_members: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'canceled' | 'past_due';
          max_projects?: number;
          max_crew_members?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'canceled' | 'past_due';
          max_projects?: number;
          max_crew_members?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'planning' | 'active' | 'completed' | 'on_hold';
          start_date: string | null;
          end_date: string | null;
          company_id: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'planning' | 'active' | 'completed' | 'on_hold';
          start_date?: string | null;
          end_date?: string | null;
          company_id: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: 'planning' | 'active' | 'completed' | 'on_hold';
          start_date?: string | null;
          end_date?: string | null;
          company_id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      crews: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          leader_id: string | null;
          company_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          leader_id?: string | null;
          company_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          leader_id?: string | null;
          company_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      crew_members: {
        Row: {
          id: string;
          crew_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      project_crews: {
        Row: {
          id: string;
          project_id: string;
          crew_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          crew_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          crew_id?: string;
          assigned_at?: string;
        };
      };
      user_invitations: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
          company_id: string;
          invited_by: string | null;
          invited_at: string;
          status: 'pending' | 'accepted' | 'expired';
          expires_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
          company_id: string;
          invited_by?: string | null;
          invited_at?: string;
          status?: 'pending' | 'accepted' | 'expired';
          expires_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
          company_id?: string;
          invited_by?: string | null;
          invited_at?: string;
          status?: 'pending' | 'accepted' | 'expired';
          expires_at?: string;
        };
      };
    };
  };
};
