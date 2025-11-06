import { create } from 'zustand';
import { Project, Task, ProjectDocument } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTaskToProject: (projectId: string, task: Omit<Task, 'id'>) => Promise<void>;
  updateTaskInProject: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTaskFromProject: (projectId: string, taskId: string) => Promise<void>;
  addDocumentToProject: (projectId: string, document: Omit<ProjectDocument, 'id'>) => Promise<void>;
  deleteDocumentFromProject: (projectId: string, documentId: string) => Promise<void>;
  assignCrewToProject: (projectId: string, crewId: string) => Promise<void>;
  removeCrewFromProject: (projectId: string, crewId: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => {
      console.log('Projects store initializing...');
      return {
      projects: [],
      isLoading: false,
      error: null,
      
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data: userProfile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single();

          if (!userProfile?.company_id) throw new Error('Company not found');

          const { data: projectsData, error } = await supabase
            .from('projects')
            .select('*')
            .eq('company_id', userProfile.company_id);

          if (error) throw error;

          const projects: Project[] = (projectsData || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            number: p.id,
            client: '',
            location: p.description || '',
            budget: 0,
            startDate: p.start_date || '',
            endDate: p.end_date || '',
            status: p.status === 'planning' ? 'pending' : p.status === 'on_hold' ? 'pending' : p.status,
            crews: [],
            tasks: [],
            documents: [],
          }));

          set({ projects, isLoading: false });
        } catch (error: any) {
          console.error('Fetch projects error:', error);
          set({ error: error.message || 'Failed to fetch projects', isLoading: false });
        }
      },
      
      addProject: async (project: Omit<Project, 'id'>) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data: userProfile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single();

          if (!userProfile?.company_id) throw new Error('Company not found');

          const { data, error } = await supabase
            .from('projects')
            .insert({
              name: project.name,
              description: project.location,
              status: project.status === 'pending' ? 'planning' : project.status,
              start_date: project.startDate,
              end_date: project.endDate,
              company_id: userProfile.company_id,
              created_by: user.id,
            })
            .select()
            .single();

          if (error) throw error;

          const newProject: Project = {
            ...project,
            id: data.id as string,
          };

          set(state => ({
            projects: [...state.projects, newProject],
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Add project error:', error);
          set({ error: error.message || 'Failed to add project', isLoading: false });
        }
      },
      
      updateProject: async (id: string, updates: Partial<Project>) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('projects')
            .update({
              name: updates.name,
              description: updates.location,
              status: updates.status === 'pending' ? 'planning' : updates.status,
              start_date: updates.startDate,
              end_date: updates.endDate,
            })
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            projects: state.projects.map(project => 
              project.id === id ? { ...project, ...updates } : project
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Update project error:', error);
          set({ error: error.message || 'Failed to update project', isLoading: false });
        }
      },
      
      deleteProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            projects: state.projects.filter(project => project.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Delete project error:', error);
          set({ error: error.message || 'Failed to delete project', isLoading: false });
        }
      },
      
      addTaskToProject: async (projectId: string, task: Omit<Task, 'id'>) => {
        try {
          const newTask: Task = {
            ...task,
            id: Date.now().toString(),
          };

          set(state => ({
            projects: state.projects.map(project => {
              if (project.id === projectId) {
                const tasks = project.tasks || [];
                return {
                  ...project,
                  tasks: [...tasks, newTask],
                };
              }
              return project;
            }),
          }));
        } catch (error: any) {
          console.error('Add task error:', error);
          set({ error: error.message || 'Failed to add task' });
        }
      },
      
      updateTaskInProject: async (projectId: string, taskId: string, updates: Partial<Task>) => {
        try {
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
        } catch (error: any) {
          console.error('Update task error:', error);
          set({ error: error.message || 'Failed to update task' });
        }
      },
      
      deleteTaskFromProject: async (projectId: string, taskId: string) => {
        try {
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
        } catch (error: any) {
          console.error('Delete task error:', error);
          set({ error: error.message || 'Failed to delete task' });
        }
      },
      
      addDocumentToProject: async (projectId: string, document: Omit<ProjectDocument, 'id'>) => {
        try {
          const newDocument: ProjectDocument = {
            ...document,
            id: Date.now().toString(),
          };

          set(state => ({
            projects: state.projects.map(project => {
              if (project.id === projectId) {
                const documents = project.documents || [];
                return {
                  ...project,
                  documents: [...documents, newDocument],
                };
              }
              return project;
            }),
          }));
        } catch (error: any) {
          console.error('Add document error:', error);
          set({ error: error.message || 'Failed to add document' });
        }
      },
      
      deleteDocumentFromProject: async (projectId: string, documentId: string) => {
        try {
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
        } catch (error: any) {
          console.error('Delete document error:', error);
          set({ error: error.message || 'Failed to delete document' });
        }
      },
      
      assignCrewToProject: async (projectId: string, crewId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('project_crews')
            .insert({
              project_id: projectId,
              crew_id: crewId,
            });

          if (error) throw error;

          set(state => ({
            projects: state.projects.map(project => {
              if (project.id === projectId) {
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
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Assign crew error:', error);
          set({ error: error.message || 'Failed to assign crew', isLoading: false });
        }
      },
      
      removeCrewFromProject: async (projectId: string, crewId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('project_crews')
            .delete()
            .eq('project_id', projectId)
            .eq('crew_id', crewId);

          if (error) throw error;

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
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Remove crew error:', error);
          set({ error: error.message || 'Failed to remove crew', isLoading: false });
        }
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
