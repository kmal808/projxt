import { create } from 'zustand';
import { Crew, User, ScheduleItem } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface CrewsState {
  crews: Crew[];
  isLoading: boolean;
  error: string | null;
  fetchCrews: () => Promise<void>;
  addCrew: (crew: Omit<Crew, 'id'>) => Promise<void>;
  updateCrew: (id: string, updates: Partial<Crew>) => Promise<void>;
  deleteCrew: (id: string) => Promise<void>;
  addMemberToCrew: (crewId: string, member: User) => Promise<void>;
  updateMemberInCrew: (crewId: string, memberId: string, updates: Partial<User>) => Promise<void>;
  removeMemberFromCrew: (crewId: string, memberId: string) => Promise<void>;
  assignProjectToCrew: (crewId: string, projectId: string) => Promise<void>;
  removeProjectFromCrew: (crewId: string, projectId: string) => Promise<void>;
  addScheduleItemToCrew: (crewId: string, scheduleItem: ScheduleItem) => Promise<void>;
  removeScheduleItemFromCrew: (crewId: string, scheduleItemId: string) => Promise<void>;
}

export const useCrewsStore = create<CrewsState>()(
  persist(
    (set, get) => {
      console.log('Crews store initializing...');
      return {
      crews: [],
      isLoading: false,
      error: null,
      
      fetchCrews: async () => {
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

          const { data: crewsData, error } = await supabase
            .from('crews')
            .select(`
              *,
              crew_members (
                user_id,
                users (*)
              )
            `)
            .eq('company_id', userProfile.company_id);

          if (error) throw error;

          const crews: Crew[] = (crewsData || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            members: (c.crew_members || []).map((cm: any) => ({
              id: cm.users.id,
              name: cm.users.full_name || 'Unknown',
              email: cm.users.email,
              role: cm.users.role,
              crewId: c.id,
              avatar: cm.users.avatar_url,
            })),
            projects: [],
            schedule: [],
          }));

          set({ crews, isLoading: false });
        } catch (error: any) {
          console.error('Fetch crews error:', error);
          set({ error: error.message || 'Failed to fetch crews', isLoading: false });
        }
      },
      
      addCrew: async (crew: Omit<Crew, 'id'>) => {
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
            .from('crews')
            .insert({
              name: crew.name,
              description: '',
              company_id: userProfile.company_id,
            })
            .select()
            .single();

          if (error) throw error;

          const newCrew: Crew = {
            ...crew,
            id: data.id as string,
          };

          set(state => ({
            crews: [...state.crews, newCrew],
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Add crew error:', error);
          set({ error: error.message || 'Failed to add crew', isLoading: false });
        }
      },
      
      updateCrew: async (id: string, updates: Partial<Crew>) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('crews')
            .update({
              name: updates.name,
            })
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            crews: state.crews.map(crew => 
              crew.id === id ? { ...crew, ...updates } : crew
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Update crew error:', error);
          set({ error: error.message || 'Failed to update crew', isLoading: false });
        }
      },
      
      deleteCrew: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('crews')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            crews: state.crews.filter(crew => crew.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Delete crew error:', error);
          set({ error: error.message || 'Failed to delete crew', isLoading: false });
        }
      },
      
      addMemberToCrew: async (crewId: string, member: User) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('crew_members')
            .insert({
              crew_id: crewId,
              user_id: member.id,
            });

          if (error) throw error;

          set(state => ({
            crews: state.crews.map(crew => {
              if (crew.id === crewId) {
                return {
                  ...crew,
                  members: [...crew.members, { ...member, crewId }],
                };
              }
              return crew;
            }),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Add member error:', error);
          set({ error: error.message || 'Failed to add member', isLoading: false });
        }
      },
      
      updateMemberInCrew: async (crewId: string, memberId: string, updates: Partial<User>) => {
        try {
          set(state => ({
            crews: state.crews.map(crew => {
              if (crew.id === crewId) {
                return {
                  ...crew,
                  members: crew.members.map(member => 
                    member.id === memberId ? { ...member, ...updates } : member
                  ),
                };
              }
              return crew;
            }),
          }));
        } catch (error: any) {
          console.error('Update member error:', error);
          set({ error: error.message || 'Failed to update member' });
        }
      },
      
      removeMemberFromCrew: async (crewId: string, memberId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('crew_members')
            .delete()
            .eq('crew_id', crewId)
            .eq('user_id', memberId);

          if (error) throw error;

          set(state => ({
            crews: state.crews.map(crew => {
              if (crew.id === crewId) {
                return {
                  ...crew,
                  members: crew.members.filter(member => member.id !== memberId),
                };
              }
              return crew;
            }),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Remove member error:', error);
          set({ error: error.message || 'Failed to remove member', isLoading: false });
        }
      },
      
      assignProjectToCrew: async (crewId: string, projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('project_crews')
            .insert({
              crew_id: crewId,
              project_id: projectId,
            });

          if (error) throw error;

          set(state => ({
            crews: state.crews.map(crew => {
              if (crew.id === crewId) {
                if (crew.projects.includes(projectId)) {
                  return crew;
                }
                
                return {
                  ...crew,
                  projects: [...crew.projects, projectId],
                };
              }
              return crew;
            }),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Assign project error:', error);
          set({ error: error.message || 'Failed to assign project', isLoading: false });
        }
      },
      
      removeProjectFromCrew: async (crewId: string, projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('project_crews')
            .delete()
            .eq('crew_id', crewId)
            .eq('project_id', projectId);

          if (error) throw error;

          set(state => ({
            crews: state.crews.map(crew => {
              if (crew.id === crewId) {
                return {
                  ...crew,
                  projects: crew.projects.filter(id => id !== projectId),
                };
              }
              return crew;
            }),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Remove project error:', error);
          set({ error: error.message || 'Failed to remove project', isLoading: false });
        }
      },
      
      addScheduleItemToCrew: async (crewId: string, scheduleItem: ScheduleItem) => {
        try {
          set(state => ({
            crews: state.crews.map(crew => {
              if (crew.id === crewId) {
                const schedule = crew.schedule || [];
                return {
                  ...crew,
                  schedule: [...schedule, { ...scheduleItem, crewId }],
                };
              }
              return crew;
            }),
          }));
        } catch (error: any) {
          console.error('Add schedule error:', error);
          set({ error: error.message || 'Failed to add schedule' });
        }
      },
      
      removeScheduleItemFromCrew: async (crewId: string, scheduleItemId: string) => {
        try {
          set(state => ({
            crews: state.crews.map(crew => {
              if (crew.id === crewId && crew.schedule) {
                return {
                  ...crew,
                  schedule: crew.schedule.filter(item => item.id !== scheduleItemId),
                };
              }
              return crew;
            }),
          }));
        } catch (error: any) {
          console.error('Remove schedule error:', error);
          set({ error: error.message || 'Failed to remove schedule' });
        }
      },
    };
    },
    {
      name: 'crews-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('Crews store: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('Crews store: Rehydration failed', error);
          } else {
            console.log('Crews store: Rehydration complete');
          }
        };
      },
    }
  )
);
