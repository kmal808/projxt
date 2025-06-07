// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  crewId?: string;
  phone?: string;
  avatar?: string;
}

// Crew types
export interface Crew {
  id: string;
  name: string;
  members: User[];
  projects: string[];
  schedule?: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  date: string;
  location: string;
  description: string;
  crewId: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  number: string;
  client: string;
  location: string;
  budget: number;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'active' | 'completed' | 'on-hold';
  crews: string[];
  tasks?: Task[];
  documents?: ProjectDocument[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  uri: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
  minQuantity?: number;
  cost?: number;
  supplier?: string;
}

// File types
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags?: string[];
  sharedWith?: string[];
  owner: string;
}

// Auth types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'field';
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}