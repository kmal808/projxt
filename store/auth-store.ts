import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUUID } from '@/utils/uuid';

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

interface UserCredentials {
  email: string;
  passwordHash: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  verificationToken?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: User['role'];
  inviteCode: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  users: User[];
  userCredentials: UserCredentials[];
  invitations: Invitation[];
  adminRequests: Array<{
    userId: string;
    userName: string;
    reason: string;
    requestDate: string;
  }>;
  
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
  updateUser: (user: Partial<User>) => void;
  updateUserRole: (userId: string, newRole: User['role']) => void;
  deleteUser: (userId: string) => Promise<void>;
  
  // Admin request methods
  requestAdminAccess: (reason: string) => Promise<void>;
  approveAdminRequest: (userId: string) => void;
  rejectAdminRequest: (userId: string) => void;
  
  // Invitation methods
  inviteUser: (email: string, role: User['role']) => Promise<string>;
  revokeInvitation: (invitationId: string) => Promise<void>;
}

// Helper function to hash passwords (in a real app, use bcrypt or similar)
const hashPassword = (password: string): string => {
  // This is a simple hash for demonstration purposes only
  // In a real app, use a proper hashing library
  return password.split('').reverse().join('') + '_hashed';
};

// Helper function to verify passwords
const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Helper function to generate tokens
const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Initial demo users for development
const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@projxt.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 123-4567',
    title: 'System Administrator',
    bio: 'Experienced administrator with a background in construction management systems.',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Project Manager',
    email: 'manager@projxt.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 234-5678',
    title: 'Senior Project Manager',
    bio: 'Experienced project manager with 10+ years in commercial construction.',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Field Worker',
    email: 'field@projxt.com',
    role: 'field',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 345-6789',
    title: 'Field Supervisor',
    bio: 'Experienced field supervisor specializing in residential construction.',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Office Staff',
    email: 'office@projxt.com',
    role: 'office',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 456-7890',
    title: 'Office Manager',
    bio: 'Organized office manager with experience in construction administration.',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Sales Rep',
    email: 'sales@projxt.com',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '(555) 567-8901',
    title: 'Sales Representative',
    bio: 'Results-driven sales professional with expertise in construction products.',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  }
];

// Initial credentials for demo users
const INITIAL_CREDENTIALS: UserCredentials[] = INITIAL_USERS.map(user => ({
  email: user.email,
  passwordHash: hashPassword('password123')
}));

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      users: INITIAL_USERS,
      userCredentials: INITIAL_CREDENTIALS,
      invitations: [],
      adminRequests: [],
      
      login: async (email: string, password: string) => {
        // Find user credentials by email
        const credentials = get().userCredentials.find(
          cred => cred.email.toLowerCase() === email.toLowerCase()
        );
        
        // Check if credentials exist and password is valid
        if (credentials && verifyPassword(password, credentials.passwordHash)) {
          // Find user by email
          const user = get().users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
          );
          
          if (user) {
            // Check if email is verified
            if (!user.isEmailVerified) {
              throw new Error('Please verify your email before logging in');
            }
            
            // Generate token
            const token = generateToken();
            
            set({ 
              user, 
              token, 
              isAuthenticated: true 
            });
            
            return true;
          }
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
      
      register: async (data) => {
        const { email, password, name, phone, title, inviteCode, role = 'field' } = data;
        
        // Check if email already exists
        const existingCredentials = get().userCredentials.find(
          cred => cred.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingCredentials) {
          throw new Error('Email already registered');
        }
        
        // Check if there's a valid invitation if invite code is provided
        let assignedRole = role;
        
        if (inviteCode) {
          const invitation = get().invitations.find(
            inv => inv.inviteCode === inviteCode && inv.email.toLowerCase() === email.toLowerCase()
          );
          
          if (!invitation) {
            throw new Error('Invalid invitation code');
          }
          
          // Use the role from the invitation
          assignedRole = invitation.role;
          
          // Remove the invitation
          set(state => ({
            ...state,
            invitations: state.invitations.filter(inv => inv.inviteCode !== inviteCode)
          }));
        } else {
          // If no users exist, make the first user an admin
          if (get().users.length === 0) {
            assignedRole = 'admin';
          }
        }
        
        // Generate verification token
        const verificationToken = generateToken();
        
        // Create new user
        const newUser: User = {
          id: generateUUID(),
          name,
          email,
          role: assignedRole,
          phone,
          title,
          isEmailVerified: false, // Require email verification
          createdAt: new Date().toISOString()
        };
        
        // Create new credentials
        const newCredentials: UserCredentials = {
          email,
          passwordHash: hashPassword(password),
          verificationToken
        };
        
        // Add user and credentials
        set(state => ({
          ...state,
          users: [...state.users, newUser],
          userCredentials: [...state.userCredentials, newCredentials]
        }));
        
        // In a real app, send verification email here
        console.log(`Verification link: /verify-email?token=${verificationToken}`);
        
        // For demo purposes, auto-verify email
        setTimeout(() => {
          const { verifyEmail } = get();
          verifyEmail(verificationToken).catch(console.error);
        }, 5000);
      },
      
      verifyEmail: async (token) => {
        // Find credentials with this verification token
        const credentialsIndex = get().userCredentials.findIndex(
          cred => cred.verificationToken === token
        );
        
        if (credentialsIndex === -1) {
          throw new Error('Invalid verification token');
        }
        
        const credentials = get().userCredentials[credentialsIndex];
        
        // Find user with this email
        const userIndex = get().users.findIndex(
          user => user.email.toLowerCase() === credentials.email.toLowerCase()
        );
        
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        
        // Update user and credentials
        set(state => {
          const updatedCredentials = [...state.userCredentials];
          updatedCredentials[credentialsIndex] = {
            ...credentials,
            verificationToken: undefined
          };
          
          const updatedUsers = [...state.users];
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            isEmailVerified: true
          };
          
          return {
            ...state,
            userCredentials: updatedCredentials,
            users: updatedUsers
          };
        });
      },
      
      requestPasswordReset: async (email) => {
        // Find credentials by email
        const credentialsIndex = get().userCredentials.findIndex(
          cred => cred.email.toLowerCase() === email.toLowerCase()
        );
        
        if (credentialsIndex === -1) {
          // Don't reveal if email exists or not for security
          return;
        }
        
        // Generate reset token
        const resetToken = generateToken();
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour
        
        // Update credentials
        set(state => {
          const updatedCredentials = [...state.userCredentials];
          updatedCredentials[credentialsIndex] = {
            ...updatedCredentials[credentialsIndex],
            resetToken,
            resetTokenExpiry
          };
          
          return {
            ...state,
            userCredentials: updatedCredentials
          };
        });
        
        // In a real app, send reset email here
        console.log(`Password reset link: /reset-password?token=${resetToken}`);
      },
      
      resetPassword: async (token, newPassword) => {
        // Find credentials with this reset token
        const credentialsIndex = get().userCredentials.findIndex(
          cred => cred.resetToken === token
        );
        
        if (credentialsIndex === -1) {
          throw new Error('Invalid reset token');
        }
        
        const credentials = get().userCredentials[credentialsIndex];
        
        // Check if token is expired
        if (credentials.resetTokenExpiry && credentials.resetTokenExpiry < Date.now()) {
          throw new Error('Reset token has expired');
        }
        
        // Update credentials
        set(state => {
          const updatedCredentials = [...state.userCredentials];
          updatedCredentials[credentialsIndex] = {
            ...credentials,
            passwordHash: hashPassword(newPassword),
            resetToken: undefined,
            resetTokenExpiry: undefined
          };
          
          return {
            ...state,
            userCredentials: updatedCredentials
          };
        });
      },
      
      updateUser: (userData) => {
        set(state => {
          if (!state.user) return state;
          
          const updatedUser = {
            ...state.user,
            ...userData
          };
          
          // Update user in users array
          const updatedUsers = state.users.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          );
          
          return {
            ...state,
            user: updatedUser,
            users: updatedUsers
          };
        });
      },
      
      updateUserRole: (userId, newRole) => {
        set(state => {
          // Update user in users array
          const updatedUsers = state.users.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          );
          
          // If the current user is being updated, update their role
          const updatedUser = state.user && state.user.id === userId
            ? { ...state.user, role: newRole }
            : state.user;
          
          return {
            ...state,
            users: updatedUsers,
            user: updatedUser
          };
        });
      },
      
      deleteUser: async (userId) => {
        const { users, userCredentials } = get();
        
        // Find user
        const user = users.find(u => u.id === userId);
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Remove user and credentials
        set(state => ({
          ...state,
          users: state.users.filter(u => u.id !== userId),
          userCredentials: state.userCredentials.filter(
            cred => cred.email.toLowerCase() !== user.email.toLowerCase()
          )
        }));
      },
      
      requestAdminAccess: async (reason) => {
        const { user } = get();
        
        if (!user) throw new Error('User not authenticated');
        
        // Add admin request
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
          
          // Update user role to admin
          const updatedUsers = state.users.map(user => 
            user.id === userId ? { ...user, role: 'admin' } : user
          );
          
          // If the current user is being approved, update their role
          const updatedUser = state.user && state.user.id === userId
            ? { ...state.user, role: 'admin' }
            : state.user;
          
          return {
            ...state,
            adminRequests: updatedRequests,
            users: updatedUsers,
            user: updatedUser
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
      },
      
      inviteUser: async (email, role) => {
        const { user, invitations } = get();
        
        if (!user) throw new Error('User not authenticated');
        
        // Check if user already exists
        const existingUser = get().users.find(
          u => u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
        
        // Check if invitation already exists
        const existingInvitation = invitations.find(
          inv => inv.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingInvitation) {
          throw new Error('Invitation already sent to this email');
        }
        
        // Generate invite code
        const inviteCode = generateToken();
        
        // Create invitation
        const invitation: Invitation = {
          id: generateUUID(),
          email,
          role,
          inviteCode,
          invitedBy: user.id,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        // Add invitation
        set(state => ({
          ...state,
          invitations: [...state.invitations, invitation]
        }));
        
        // In a real app, send invitation email here
        const inviteLink = `/register?inviteCode=${inviteCode}&email=${encodeURIComponent(email)}&role=${role}`;
        console.log(`Invitation link: ${inviteLink}`);
        
        return inviteLink;
      },
      
      revokeInvitation: async (invitationId) => {
        set(state => ({
          ...state,
          invitations: state.invitations.filter(inv => inv.id !== invitationId)
        }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        users: state.users,
        userCredentials: state.userCredentials,
        invitations: state.invitations,
        adminRequests: state.adminRequests,
        // Don't persist current user session
        user: null,
        token: null,
        isAuthenticated: false
      })
    }
  )
);