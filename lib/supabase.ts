import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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