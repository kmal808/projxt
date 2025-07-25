import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'field' | 'office' | 'sales';
  avatar?: string;
  phone?: string;
  title?: string;
  bio?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    title?: string;
    inviteCode?: string;
    role?: User['role'];
  }) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  // User management methods
  updateUser: (user: Partial<User>) => Promise<void>;
  
  // Admin request methods
  requestAdminAccess: (reason: string) => Promise<void>;
  
  // Invitation methods
  inviteUser: (email: string, role: User['role']) => Promise<string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.login.mutate({ email, password });
          
          if (result.success) {
            set({ 
              user: result.user, 
              token: result.token, 
              isAuthenticated: true,
              isLoading: false
            });
            
            return true;
          } else {
            set({ 
              error: result.message || 'Login failed', 
              isLoading: false 
            });
            
            return false;
          }
        } catch (error: any) {
          console.error('Login error:', error);
          
          // For development, allow bypassing auth if backend is not available
          if (error.message?.includes('fetch') || error.message?.includes('network')) {
            console.warn('Backend not available, using mock authentication');
            set({ 
              user: {
                id: 'mock-user',
                name: 'Demo User',
                email: email,
                role: 'admin',
                isEmailVerified: true,
                createdAt: new Date().toISOString()
              }, 
              token: 'mock-token', 
              isAuthenticated: true,
              isLoading: false
            });
            return true;
          }
          
          set({ 
            error: error.message || 'An error occurred during login', 
            isLoading: false 
          });
          
          return false;
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.register.mutate(data);
          
          if (result.success) {
            // In a real app, you might want to automatically log the user in
            // or redirect them to verify their email
            set({ isLoading: false });
          } else {
            set({ 
              error: result.message || 'Registration failed', 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during registration', 
            isLoading: false 
          });
        }
      },
      
      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.verifyEmail.mutate({ token });
          
          if (result.success) {
            set({ isLoading: false });
          } else {
            set({ 
              error: result.message || 'Email verification failed', 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during email verification', 
            isLoading: false 
          });
        }
      },
      
      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.requestPasswordReset.mutate({ email });
          
          if (result.success) {
            set({ isLoading: false });
          } else {
            set({ 
              error: result.message || 'Password reset request failed', 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during password reset request', 
            isLoading: false 
          });
        }
      },
      
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.resetPassword.mutate({ token, newPassword });
          
          if (result.success) {
            set({ isLoading: false });
          } else {
            set({ 
              error: result.message || 'Password reset failed', 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during password reset', 
            isLoading: false 
          });
        }
      },
      
      updateUser: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.updateUser.mutate(userData);
          
          if (result.success) {
            set({ 
              user: result.user as unknown as User,
              isLoading: false
            });
          } else {
            set({ 
              error: result.message || 'User update failed', 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during user update', 
            isLoading: false 
          });
        }
      },
      
      requestAdminAccess: async (reason) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.requestAdminAccess.mutate({ reason });
          
          if (result.success) {
            set({ isLoading: false });
          } else {
            set({ 
              error: result.message || 'Admin access request failed', 
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during admin access request', 
            isLoading: false 
          });
        }
      },
      
      inviteUser: async (email, role) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await trpcClient.auth.inviteUser.mutate({ email, role });
          
          if (result.success) {
            set({ isLoading: false });
            return result.inviteLink;
          } else {
            set({ 
              error: result.message || 'User invitation failed', 
              isLoading: false 
            });
            throw new Error(result.message || 'User invitation failed');
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during user invitation', 
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist the token
        token: state.token,
        // Don't persist other state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  )
);