import { create } from 'zustand';
import { Project, Task, ProjectDocument } from '@/types';

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
    tasks: [
      {
        id: 't1',
        projectId: 'p1',
        title: 'Site preparation',
        status: 'completed',
        assignedTo: 'John Smith',
        priority: 'medium',
        createdAt: '2023-06-16T08:00:00Z',
        updatedAt: '2023-06-20T14:30:00Z'
      },
      {
        id: 't2',
        projectId: 'p1',
        title: 'Foundation work',
        status: 'in_progress',
        assignedTo: 'Mike Johnson',
        priority: 'high',
        createdAt: '2023-06-21T09:15:00Z',
        updatedAt: '2023-07-05T11:45:00Z'
      },
      {
        id: 't3',
        projectId: 'p1',
        title: 'Framing',
        status: 'todo',
        assignedTo: 'Sarah Williams',
        priority: 'medium',
        createdAt: '2023-07-01T10:30:00Z',
        updatedAt: '2023-07-01T10:30:00Z'
      }
    ],
    documents: [
      {
        id: 'd1',
        name: 'Building Permit',
        type: 'PDF Document',
        size: 2456789,
        uri: 'https://example.com/documents/building-permit.pdf',
        uploadedBy: 'Admin User',
        uploadedAt: '2023-06-10T09:00:00Z',
        folder: 'Permits'
      },
      {
        id: 'd2',
        name: 'Floor Plans',
        type: 'CAD Drawing',
        size: 5678901,
        uri: 'https://example.com/documents/floor-plans.dwg',
        uploadedBy: 'Project Manager',
        uploadedAt: '2023-06-12T14:30:00Z',
        folder: 'Plans',
        tags: ['approved', 'final']
      }
    ]
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
    tasks: [
      {
        id: 't4',
        projectId: 'p2',
        title: 'Finalize design plans',
        status: 'in_progress',
        assignedTo: 'Lisa Chen',
        priority: 'high',
        createdAt: '2023-07-15T08:30:00Z',
        updatedAt: '2023-07-20T16:45:00Z'
      },
      {
        id: 't5',
        projectId: 'p2',
        title: 'Obtain permits',
        status: 'todo',
        assignedTo: 'Robert Taylor',
        priority: 'high',
        createdAt: '2023-07-16T09:00:00Z',
        updatedAt: '2023-07-16T09:00:00Z'
      }
    ],
    documents: [
      {
        id: 'd3',
        name: 'Initial Design Proposal',
        type: 'PDF Document',
        size: 3456789,
        uri: 'https://example.com/documents/design-proposal.pdf',
        uploadedBy: 'Project Manager',
        uploadedAt: '2023-07-05T11:15:00Z',
        folder: 'Designs',
        tags: ['draft', 'review']
      }
    ]
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
    tasks: [
      {
        id: 't6',
        projectId: 'p3',
        title: 'Final inspection',
        status: 'completed',
        assignedTo: 'John Smith',
        priority: 'high',
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2023-07-19T15:30:00Z'
      },
      {
        id: 't7',
        projectId: 'p3',
        title: 'Client walkthrough',
        status: 'completed',
        assignedTo: 'Project Manager',
        priority: 'medium',
        createdAt: '2023-07-18T09:30:00Z',
        updatedAt: '2023-07-20T11:00:00Z'
      }
    ],
    documents: [
      {
        id: 'd4',
        name: 'Final Inspection Report',
        type: 'PDF Document',
        size: 1234567,
        uri: 'https://example.com/documents/inspection-report.pdf',
        uploadedBy: 'Admin User',
        uploadedAt: '2023-07-19T16:00:00Z',
        folder: 'Inspections',
        tags: ['final', 'approved']
      },
      {
        id: 'd5',
        name: 'Handover Documents',
        type: 'ZIP Archive',
        size: 7890123,
        uri: 'https://example.com/documents/handover.zip',
        uploadedBy: 'Project Manager',
        uploadedAt: '2023-07-20T14:00:00Z',
        folder: 'Handover',
        tags: ['final', 'client']
      }
    ]
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
    tasks: [
      {
        id: 't8',
        projectId: 'p4',
        title: 'Resolve permit issues',
        status: 'in_progress',
        assignedTo: 'Robert Taylor',
        priority: 'high',
        createdAt: '2023-05-15T08:30:00Z',
        updatedAt: '2023-06-01T14:00:00Z'
      },
      {
        id: 't9',
        projectId: 'p4',
        title: 'Update budget proposal',
        status: 'todo',
        assignedTo: 'Project Manager',
        priority: 'medium',
        createdAt: '2023-06-02T09:15:00Z',
        updatedAt: '2023-06-02T09:15:00Z'
      }
    ],
    documents: [
      {
        id: 'd6',
        name: 'Permit Application',
        type: 'PDF Document',
        size: 2345678,
        uri: 'https://example.com/documents/permit-application.pdf',
        uploadedBy: 'Admin User',
        uploadedAt: '2023-05-05T10:30:00Z',
        folder: 'Permits',
        tags: ['pending', 'review']
      },
      {
        id: 'd7',
        name: 'Budget Revision',
        type: 'Spreadsheet',
        size: 1234567,
        uri: 'https://example.com/documents/budget-revision.xlsx',
        uploadedBy: 'Project Manager',
        uploadedAt: '2023-06-01T15:45:00Z',
        folder: 'Budgets',
        tags: ['draft', 'review']
      }
    ]
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
    tasks: [
      {
        id: 't10',
        projectId: 'p5',
        title: 'Site preparation',
        status: 'completed',
        assignedTo: 'John Smith',
        priority: 'medium',
        createdAt: '2023-07-16T08:00:00Z',
        updatedAt: '2023-07-25T16:30:00Z'
      },
      {
        id: 't11',
        projectId: 'p5',
        title: 'Foundation work',
        status: 'in_progress',
        assignedTo: 'Mike Johnson',
        priority: 'high',
        createdAt: '2023-07-26T09:00:00Z',
        updatedAt: '2023-08-05T14:15:00Z'
      },
      {
        id: 't12',
        projectId: 'p5',
        title: 'Order materials',
        status: 'todo',
        assignedTo: 'Sarah Williams',
        priority: 'medium',
        createdAt: '2023-08-01T10:30:00Z',
        updatedAt: '2023-08-01T10:30:00Z'
      }
    ],
    documents: [
      {
        id: 'd8',
        name: 'Building Permit',
        type: 'PDF Document',
        size: 2456789,
        uri: 'https://example.com/documents/building-permit-hotel.pdf',
        uploadedBy: 'Admin User',
        uploadedAt: '2023-07-10T09:30:00Z',
        folder: 'Permits',
        tags: ['approved', 'final']
      },
      {
        id: 'd9',
        name: 'Architectural Plans',
        type: 'PDF Document',
        size: 8901234,
        uri: 'https://example.com/documents/architectural-plans.pdf',
        uploadedBy: 'Project Manager',
        uploadedAt: '2023-07-12T14:00:00Z',
        folder: 'Plans',
        tags: ['approved', 'final']
      }
    ]
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
  addTaskToProject: (projectId, task) => {
    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.id === projectId) {
          const currentTasks = project.tasks || [];
          return {
            ...project,
            tasks: [...currentTasks, task],
          };
        }
        return project;
      }),
    }));
  },
  updateTaskInProject: (projectId, taskId, updates) => {
    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.id === projectId && project.tasks) {
          return {
            ...project,
            tasks: project.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          };
        }
        return project;
      }),
    }));
  },
  deleteTaskFromProject: (projectId, taskId) => {
    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.id === projectId && project.tasks) {
          return {
            ...project,
            tasks: project.tasks.filter((task) => task.id !== taskId),
          };
        }
        return project;
      }),
    }));
  },
  addDocumentToProject: (projectId, document) => {
    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.id === projectId) {
          const currentDocuments = project.documents || [];
          return {
            ...project,
            documents: [...currentDocuments, document],
          };
        }
        return project;
      }),
    }));
  },
  deleteDocumentFromProject: (projectId, documentId) => {
    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.id === projectId && project.documents) {
          return {
            ...project,
            documents: project.documents.filter((doc) => doc.id !== documentId),
          };
        }
        return project;
      }),
    }));
  },
}));