import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, type AuthUser } from '@/lib/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'crew_leader' | 'worker';
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
  logout: () => Promise<void>;
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
    (set, get) => {
      console.log('Auth store initializing...');
      return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user: authUser, session } = await authService.signIn(email, password);
          
          if (authUser && session) {
            const userProfile = await authService.getCurrentUser();
            
            if (userProfile) {
              set({ 
                user: {
                  id: userProfile.id,
                  name: userProfile.full_name || 'User',
                  email: userProfile.email,
                  role: userProfile.role,
                  avatar: userProfile.avatar_url || undefined,
                  isEmailVerified: true,
                  createdAt: userProfile.created_at
                }, 
                token: session.access_token, 
                isAuthenticated: true,
                isLoading: false
              });
              
              return true;
            }
          }
          
          set({ 
            error: 'Login failed', 
            isLoading: false 
          });
          
          return false;
        } catch (error: any) {
          console.error('Login error:', error);
          
          set({ 
            error: error.message || 'An error occurred during login', 
            isLoading: false 
          });
          
          return false;
        }
      },
      
      logout: async () => {
        try {
          await authService.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.signUp(data.email, data.password, data.name);
          set({ isLoading: false });
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
          // Supabase handles email verification automatically
          // This is a placeholder for any additional verification logic
          set({ isLoading: false });
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
          await authService.resetPassword(email);
          set({ isLoading: false });
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
          await authService.updatePassword(newPassword);
          set({ isLoading: false });
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
          // Update user profile in Supabase
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            set({ 
              user: updatedUser,
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
          // Placeholder for admin access request logic
          console.log('Admin access requested:', reason);
          set({ isLoading: false });
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
          const currentUser = get().user;
          if (!currentUser) throw new Error('Not authenticated');
          if (!currentUser.id) throw new Error('User ID not found');
          
          const userProfile = await authService.getCurrentUser();
          if (!userProfile?.company_id) throw new Error('Company ID not found');
          
          await authService.inviteUser(email, role, userProfile.company_id);
          
          const inviteLink = `your-app://invite?email=${encodeURIComponent(email)}&role=${role}`;
          
          set({ isLoading: false });
          return inviteLink;
        } catch (error: any) {
          set({ 
            error: error.message || 'An error occurred during user invitation', 
            isLoading: false 
          });
          throw error;
        }
      },
    };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('Auth store: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('Auth store: Rehydration failed', error);
          } else {
            console.log('Auth store: Rehydration complete');
          }
        };
      },
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