import { create } from 'zustand';
import { Crew } from '@/types';

interface CrewsState {
  crews: Crew[];
  isLoading: boolean;
  error: string | null;
  fetchCrews: () => Promise<void>;
  addCrew: (crew: Crew) => void;
  updateCrew: (id: string, updates: Partial<Crew>) => void;
  deleteCrew: (id: string) => void;
}

// Mock crew data
const mockCrews: Crew[] = [
  {
    id: 'crew1',
    name: 'Alpha Team',
    members: [
      {
        id: '3',
        name: 'Field Worker',
        email: 'field@constructionpro.com',
        role: 'field',
        crewId: 'crew1',
      },
      {
        id: '6',
        name: 'John Smith',
        email: 'john@constructionpro.com',
        role: 'field',
        crewId: 'crew1',
      },
      {
        id: '7',
        name: 'Mike Johnson',
        email: 'mike@constructionpro.com',
        role: 'field',
        crewId: 'crew1',
      },
    ],
    projects: ['p1', 'p3', 'p5'],
  },
  {
    id: 'crew2',
    name: 'Beta Team',
    members: [
      {
        id: '8',
        name: 'Sarah Williams',
        email: 'sarah@constructionpro.com',
        role: 'field',
        crewId: 'crew2',
      },
      {
        id: '9',
        name: 'David Brown',
        email: 'david@constructionpro.com',
        role: 'field',
        crewId: 'crew2',
      },
    ],
    projects: ['p1', 'p4', 'p5'],
  },
  {
    id: 'crew3',
    name: 'Gamma Team',
    members: [
      {
        id: '10',
        name: 'Lisa Chen',
        email: 'lisa@constructionpro.com',
        role: 'field',
        crewId: 'crew3',
      },
      {
        id: '11',
        name: 'Robert Taylor',
        email: 'robert@constructionpro.com',
        role: 'field',
        crewId: 'crew3',
      },
      {
        id: '12',
        name: 'Emily Davis',
        email: 'emily@constructionpro.com',
        role: 'field',
        crewId: 'crew3',
      },
    ],
    projects: ['p2', 'p4'],
  },
];

export const useCrewsStore = create<CrewsState>((set) => ({
  crews: [],
  isLoading: false,
  error: null,
  fetchCrews: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ crews: mockCrews, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch crews', isLoading: false });
    }
  },
  addCrew: (crew) => {
    set((state) => ({
      crews: [...state.crews, crew],
    }));
  },
  updateCrew: (id, updates) => {
    set((state) => ({
      crews: state.crews.map((crew) =>
        crew.id === id ? { ...crew, ...updates } : crew
      ),
    }));
  },
  deleteCrew: (id) => {
    set((state) => ({
      crews: state.crews.filter((crew) => crew.id !== id),
    }));
  },
}));