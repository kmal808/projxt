import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'field' | 'office' | 'sales';
  avatar?: string;
  phone?: string;
  title?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateUserRole: (userId: string, newRole: User['role']) => void;
  requestAdminAccess: (reason: string) => Promise<void>;
  adminRequests: Array<{
    userId: string;
    userName: string;
    reason: string;
    requestDate: string;
  }>;
  approveAdminRequest: (userId: string) => void;
  rejectAdminRequest: (userId: string) => void;
}

// Mock user database
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@projxt.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 123-4567',
    title: 'System Administrator',
    bio: 'Experienced administrator with a background in construction management systems.'
  },
  {
    id: '2',
    name: 'Project Manager',
    email: 'manager@projxt.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 234-5678',
    title: 'Senior Project Manager',
    bio: 'Experienced project manager with 10+ years in commercial construction.'
  },
  {
    id: '3',
    name: 'Field Worker',
    email: 'field@projxt.com',
    role: 'field',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 345-6789',
    title: 'Field Supervisor',
    bio: 'Experienced field supervisor specializing in residential construction.'
  },
  {
    id: '4',
    name: 'Office Staff',
    email: 'office@projxt.com',
    role: 'office',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 456-7890',
    title: 'Office Manager',
    bio: 'Organized office manager with experience in construction administration.'
  },
  {
    id: '5',
    name: 'Sales Rep',
    email: 'sales@projxt.com',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 567-8901',
    title: 'Sales Representative',
    bio: 'Results-driven sales professional with expertise in construction products.'
  },
  {
    id: '6',
    name: 'Demo User',
    email: 'demo@projxt.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 987-6543',
    title: 'Demo Account',
    bio: 'This is a demo account for testing purposes.'
  }
];

// Helper function to find a user by email
export const findUserByEmail = (email: string): User | undefined => {
  return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Mock password validation (in a real app, this would be done on the server)
const validatePassword = (email: string, password: string): boolean => {
  // For demo purposes, accept any password for demo accounts
  if (email.includes('@projxt.com') && password === 'password123') {
    return true;
  }
  
  // For real implementation, this would check hashed passwords
  return false;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      adminRequests: [],
      
      login: async (email: string, password: string) => {
        // In a real app, this would make an API call to authenticate
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by email
        const user = findUserByEmail(email);
        
        // Check if user exists and password is valid
        if (user && validatePassword(email, password)) {
          // Generate mock token
          const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
          
          set({ 
            user, 
            token, 
            isAuthenticated: true 
          });
          
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
      
      updateUser: (updatedUserData) => {
        set(state => {
          if (!state.user) return state;
          
          const updatedUser = {
            ...state.user,
            ...updatedUserData
          };
          
          // In a real app, this would make an API call to update the user
          
          return {
            ...state,
            user: updatedUser
          };
        });
      },
      
      updateUserRole: (userId, newRole) => {
        set(state => {
          // In a real app, this would make an API call to update the user's role
          
          // If the current user is being updated, update their role
          if (state.user && state.user.id === userId) {
            return {
              ...state,
              user: {
                ...state.user,
                role: newRole
              }
            };
          }
          
          return state;
        });
      },
      
      requestAdminAccess: async (reason) => {
        const { user } = get();
        
        if (!user) throw new Error('User not authenticated');
        
        // In a real app, this would make an API call to request admin access
        
        set(state => ({
          ...state,
          adminRequests: [
            ...state.adminRequests,
            {
              userId: user.id,
              userName: user.name,
              reason,
              requestDate: new Date().toISOString()
            }
          ]
        }));
      },
      
      approveAdminRequest: (userId) => {
        set(state => {
          // Remove the request from the list
          const updatedRequests = state.adminRequests.filter(
            request => request.userId !== userId
          );
          
          // If the current user is being approved, update their role
          if (state.user && state.user.id === userId) {
            return {
              ...state,
              user: {
                ...state.user,
                role: 'admin'
              },
              adminRequests: updatedRequests
            };
          }
          
          return {
            ...state,
            adminRequests: updatedRequests
          };
        });
      },
      
      rejectAdminRequest: (userId) => {
        set(state => ({
          ...state,
          adminRequests: state.adminRequests.filter(
            request => request.userId !== userId
          )
        }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);