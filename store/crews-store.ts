import { create } from 'zustand';
import { Crew, User, ScheduleItem } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

// Mock data for initial crews
const initialCrews: Crew[] = [
  {
    id: 'crew1',
    name: 'Alpha Team',
    members: [
      {
        id: 'user1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'foreman',
        crewId: 'crew1',
        phone: '555-123-4567',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      {
        id: 'user2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'electrician',
        crewId: 'crew1',
        phone: '555-234-5678',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
      {
        id: 'user3',
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        role: 'carpenter',
        crewId: 'crew1',
        phone: '555-345-6789',
      },
    ],
    projects: ['project1'],
    schedule: [
      {
        id: 'schedule1',
        date: '2023-09-15',
        location: 'Downtown Office Site',
        description: 'Complete electrical work on 3rd floor',
        crewId: 'crew1',
      },
      {
        id: 'schedule2',
        date: '2023-09-20',
        location: 'Downtown Office Site',
        description: 'Install drywall in conference rooms',
        crewId: 'crew1',
      },
    ],
  },
  {
    id: 'crew2',
    name: 'Beta Team',
    members: [
      {
        id: 'user4',
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        role: 'foreman',
        crewId: 'crew2',
        phone: '555-456-7890',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
      {
        id: 'user5',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        role: 'plumber',
        crewId: 'crew2',
        phone: '555-567-8901',
        avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
      },
    ],
    projects: ['project2'],
  },
  {
    id: 'crew3',
    name: 'Gamma Team',
    members: [
      {
        id: 'user6',
        name: 'David Miller',
        email: 'david.miller@example.com',
        role: 'foreman',
        crewId: 'crew3',
        phone: '555-678-9012',
        avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      },
    ],
    projects: [],
  },
];

interface CrewsState {
  crews: Crew[];
  isLoading: boolean;
  error: string | null;
  fetchCrews: () => Promise<void>;
  addCrew: (crew: Crew) => void;
  updateCrew: (id: string, updates: Partial<Crew>) => void;
  deleteCrew: (id: string) => void;
  addMemberToCrew: (crewId: string, member: User) => void;
  updateMemberInCrew: (crewId: string, memberId: string, updates: Partial<User>) => void;
  removeMemberFromCrew: (crewId: string, memberId: string) => void;
  assignProjectToCrew: (crewId: string, projectId: string) => void;
  removeProjectFromCrew: (crewId: string, projectId: string) => void;
  addScheduleItemToCrew: (crewId: string, scheduleItem: ScheduleItem) => void;
  removeScheduleItemFromCrew: (crewId: string, scheduleItemId: string) => void;
}

export const useCrewsStore = create<CrewsState>()(
  persist(
    (set, get) => ({
      crews: initialCrews,
      isLoading: false,
      error: null,
      
      fetchCrews: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // For now, we'll just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // If we already have crews, don't reset them
          if (get().crews.length === 0) {
            set({ crews: initialCrews });
          }
        } catch (error) {
          set({ error: 'Failed to fetch crews' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      addCrew: (crew: Crew) => {
        set(state => ({
          crews: [...state.crews, crew],
        }));
      },
      
      updateCrew: (id: string, updates: Partial<Crew>) => {
        set(state => ({
          crews: state.crews.map(crew => 
            crew.id === id ? { ...crew, ...updates } : crew
          ),
        }));
      },
      
      deleteCrew: (id: string) => {
        set(state => ({
          crews: state.crews.filter(crew => crew.id !== id),
        }));
      },
      
      addMemberToCrew: (crewId: string, member: User) => {
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
        }));
      },
      
      updateMemberInCrew: (crewId: string, memberId: string, updates: Partial<User>) => {
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
      },
      
      removeMemberFromCrew: (crewId: string, memberId: string) => {
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
        }));
      },
      
      assignProjectToCrew: (crewId: string, projectId: string) => {
        set(state => ({
          crews: state.crews.map(crew => {
            if (crew.id === crewId) {
              // Check if project is already assigned
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
        }));
      },
      
      removeProjectFromCrew: (crewId: string, projectId: string) => {
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
        }));
      },
      
      addScheduleItemToCrew: (crewId: string, scheduleItem: ScheduleItem) => {
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
      },
      
      removeScheduleItemFromCrew: (crewId: string, scheduleItemId: string) => {
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
      },
    }),
    {
      name: 'crews-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);