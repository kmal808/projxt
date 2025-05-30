import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

// Mock project data
const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Riverside Apartments',
    number: 'PRJ-2023-001',
    status: 'active',
    client: 'Riverside Development LLC',
    startDate: '2023-06-15',
    endDate: '2023-12-30',
    crews: ['crew1', 'crew2'],
    budget: 1250000,
    location: '123 Riverside Dr, Portland, OR',
  },
  {
    id: 'p2',
    name: 'Highland Office Complex',
    number: 'PRJ-2023-002',
    status: 'pending',
    client: 'Highland Commercial Properties',
    startDate: '2023-08-01',
    crews: ['crew3'],
    budget: 850000,
    location: '456 Highland Ave, Seattle, WA',
  },
  {
    id: 'p3',
    name: 'Oakwood Residential',
    number: 'PRJ-2023-003',
    status: 'completed',
    client: 'Oakwood Homes',
    startDate: '2023-02-10',
    endDate: '2023-07-20',
    crews: ['crew1'],
    budget: 650000,
    location: '789 Oak St, Vancouver, BC',
  },
  {
    id: 'p4',
    name: 'Sunset Mall Renovation',
    number: 'PRJ-2023-004',
    status: 'on-hold',
    client: 'Sunset Retail Group',
    startDate: '2023-05-01',
    crews: ['crew2', 'crew3'],
    budget: 1750000,
    location: '101 Sunset Blvd, San Francisco, CA',
  },
  {
    id: 'p5',
    name: 'Bayside Hotel',
    number: 'PRJ-2023-005',
    status: 'active',
    client: 'Bayside Hospitality',
    startDate: '2023-07-15',
    crews: ['crew1', 'crew2'],
    budget: 2250000,
    location: '202 Bay View Rd, San Diego, CA',
  },
];

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ projects: mockProjects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },
  addProject: (project) => {
    set((state) => ({
      projects: [...state.projects, project],
    }));
  },
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      ),
    }));
  },
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    }));
  },
}));