import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'canceled' | 'past_due';
  max_projects: number;
  max_crew_members: number;
  created_at: string;
  updated_at: string;
}

class AuthService {
  async signUp(email: string, password: string, fullName: string, companyName?: string) {
    try {
      console.log('Starting signup process for:', email);
      
      // Sign up with Supabase Auth - disable email confirmation for development
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined,
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user returned from signup');
        throw new Error('User creation failed');
      }

      console.log('Auth user created:', authData.user.id);

      // Wait a bit for the trigger to create the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create company if provided (for first admin user)
      let companyId: string | null = null;
      if (companyName) {
        console.log('Creating company:', companyName);
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            subscription_tier: 'free',
            subscription_status: 'active',
            max_projects: 1,
            max_crew_members: 1,
          })
          .select()
          .single();

        if (companyError) {
          console.error('Company creation error:', companyError);
          throw companyError;
        }
        companyId = company.id as string;
        console.log('Company created:', companyId);
      }

      // Update user profile with company and role
      console.log('Updating user profile...');
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          role: companyName ? 'admin' : 'worker',
          company_id: companyId,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Signup completed successfully');
      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }

      if (!data.session) {
        console.error('No session returned from sign in');
        throw new Error('Login failed - no session created');
      }

      console.log('Sign in successful for user:', data.user?.id);

      // Store session token
      if (data.session?.access_token) {
        await AsyncStorage.setItem('supabase_token', data.session.access_token);
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('supabase_token');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('No authenticated user found');
        return null;
      }

      console.log('Fetching user profile for:', user.id);

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', JSON.stringify(profileError, null, 2));
        console.error('Profile error details:', profileError.message, profileError.code, profileError.details);
        return null;
      }
      
      if (!profile) {
        console.error('No profile found for user:', user.id);
        return null;
      }

      console.log('User profile fetched successfully');
      return profile as unknown as AuthUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  async inviteUser(email: string, role: AuthUser['role'], companyId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role,
          company_id: companyId,
          invited_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Invite user error:', error);
      throw error;
    }
  }

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();