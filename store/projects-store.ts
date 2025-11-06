import { create } from 'zustand';
import { Project, Task, ProjectDocument } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

// Mock data for initial projects
const initialProjects: Project[] = [
  {
    id: 'project1',
    name: 'Downtown Office Renovation',
    number: 'PRJ-2023-001',
    client: 'Acme Corporation',
    location: '123 Main St, Downtown',
    budget: 250000,
    startDate: '2023-06-15',
    endDate: '2023-12-30',
    status: 'active',
    crews: ['crew1'],
    tasks: [
      {
        id: 'task1',
        projectId: 'project1',
        title: 'Demolition of existing walls',
        description: 'Remove all non-load bearing walls on the 3rd floor',
        assignedTo: 'John Smith',
        dueDate: '2023-07-15',
        status: 'completed',
        priority: 'high',
        createdAt: '2023-06-16',
        updatedAt: '2023-07-10',
      },
      {
        id: 'task2',
        projectId: 'project1',
        title: 'Electrical rewiring',
        description: 'Install new electrical system according to plans',
        assignedTo: 'Sarah Johnson',
        dueDate: '2023-08-30',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2023-06-20',
        updatedAt: '2023-08-05',
      },
      {
        id: 'task3',
        projectId: 'project1',
        title: 'Install new flooring',
        description: 'Install hardwood flooring in all office spaces',
        assignedTo: 'Mike Wilson',
        dueDate: '2023-10-15',
        status: 'todo',
        priority: 'medium',
        createdAt: '2023-06-25',
        updatedAt: '2023-06-25',
      },
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Floor Plans',
        type: 'PDF',
        uri: 'https://example.com/floorplans.pdf',
        size: 2500000,
        uploadedBy: 'Project Manager',
        uploadedAt: '2023-06-15',
      },
      {
        id: 'doc2',
        name: 'Electrical Diagrams',
        type: 'DWG',
        uri: 'https://example.com/electrical.dwg',
        size: 1800000,
        uploadedBy: 'Electrical Engineer',
        uploadedAt: '2023-06-18',
      },
    ],
  },
  {
    id: 'project2',
    name: 'Riverside Apartment Complex',
    number: 'PRJ-2023-002',
    client: 'Riverside Development LLC',
    location: '456 River Rd, Eastside',
    budget: 5000000,
    startDate: '2023-05-01',
    endDate: '2024-08-30',
    status: 'active',
    crews: ['crew2'],
    tasks: [
      {
        id: 'task4',
        projectId: 'project2',
        title: 'Foundation work',
        description: 'Complete foundation for buildings A and B',
        assignedTo: 'Construction Team A',
        dueDate: '2023-07-30',
        status: 'completed',
        priority: 'high',
        createdAt: '2023-05-05',
        updatedAt: '2023-07-25',
      },
      {
        id: 'task5',
        projectId: 'project2',
        title: 'Framing for Building A',
        description: 'Complete wood framing for Building A',
        assignedTo: 'Construction Team B',
        dueDate: '2023-09-15',
        status: 'in_progress',
        priority: 'high',
        createdAt: '2023-05-10',
        updatedAt: '2023-08-01',
      },
    ],
  },
  {
    id: 'project3',
    name: 'City Park Renovation',
    number: 'PRJ-2023-003',
    client: 'City Parks Department',
    location: 'Central Park, Northside',
    budget: 750000,
    startDate: '2023-08-01',
    endDate: '2024-04-30',
    status: 'pending',
    crews: [],
    tasks: [],
  },
];

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTaskToProject: (projectId: string, task: Task) => void;
  updateTaskInProject: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTaskFromProject: (projectId: string, taskId: string) => void;
  addDocumentToProject: (projectId: string, document: ProjectDocument) => void;
  deleteDocumentFromProject: (projectId: string, documentId: string) => void;
  assignCrewToProject: (projectId: string, crewId: string) => void;
  removeCrewFromProject: (projectId: string, crewId: string) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => {
      console.log('Projects store initializing...');
      return {
      projects: initialProjects,
      isLoading: false,
      error: null,
      
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we'll just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // If we already have projects, don't reset them
          if (get().projects.length === 0) {
            set({ projects: initialProjects });
          }
        } catch (error) {
          set({ error: 'Failed to fetch projects' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      addProject: (project: Project) => {
        set(state => ({
          projects: [...state.projects, project],
        }));
      },
      
      updateProject: (id: string, updates: Partial<Project>) => {
        set(state => ({
          projects: state.projects.map(project => 
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
      },
      
      deleteProject: (id: string) => {
        set(state => ({
          projects: state.projects.filter(project => project.id !== id),
        }));
      },
      
      addTaskToProject: (projectId: string, task: Task) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id === projectId) {
              const tasks = project.tasks || [];
              return {
                ...project,
                tasks: [...tasks, task],
              };
            }
            return project;
          }),
        }));
      },
      
      updateTaskInProject: (projectId: string, taskId: string, updates: Partial<Task>) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id === projectId && project.tasks) {
              return {
                ...project,
                tasks: project.tasks.map(task => 
                  task.id === taskId ? { ...task, ...updates } : task
                ),
              };
            }
            return project;
          }),
        }));
      },
      
      deleteTaskFromProject: (projectId: string, taskId: string) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id === projectId && project.tasks) {
              return {
                ...project,
                tasks: project.tasks.filter(task => task.id !== taskId),
              };
            }
            return project;
          }),
        }));
      },
      
      addDocumentToProject: (projectId: string, document: ProjectDocument) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id === projectId) {
              const documents = project.documents || [];
              return {
                ...project,
                documents: [...documents, document],
              };
            }
            return project;
          }),
        }));
      },
      
      deleteDocumentFromProject: (projectId: string, documentId: string) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id === projectId && project.documents) {
              return {
                ...project,
                documents: project.documents.filter(doc => doc.id !== documentId),
              };
            }
            return project;
          }),
        }));
      },
      
      assignCrewToProject: (projectId: string, crewId: string) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id === projectId) {
              // Check if crew is already assigned
              if (project.crews.includes(crewId)) {
                return project;
              }
              
              return {
                ...project,
                crews: [...project.crews, crewId],
              };
            }
            return project;
          }),
        }));
      },
      
      removeCrewFromProject: (projectId: string, crewId: string) => {
        set(state => ({
          projects: state.projects.map(project => {
            if (project.id === projectId) {
              return {
                ...project,
                crews: project.crews.filter(id => id !== crewId),
              };
            }
            return project;
          }),
        }));
      },
    };
    },
    {
      name: 'projects-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('Projects store: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('Projects store: Rehydration failed', error);
          } else {
            console.log('Projects store: Rehydration complete');
          }
        };
      },
    }
  )
);