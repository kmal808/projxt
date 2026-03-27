import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem } from '@/types';
import { supabase } from '@/lib/supabase';

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => InventoryItem | undefined;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchItems: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          set({ items: [], isLoading: false });
        } catch (error: any) {
          console.error('Fetch inventory error:', error);
          set({ error: error.message || 'Failed to fetch inventory', isLoading: false });
        }
      },
      
      addItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const newItem: InventoryItem = {
            ...item,
            id: Date.now().toString(),
            lastUpdated: new Date().toISOString().split('T')[0],
          };

          set((state) => ({
            items: [...state.items, newItem],
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Add inventory error:', error);
          set({ error: error.message || 'Failed to add inventory', isLoading: false });
        }
      },
      
      updateItem: async (id, updatedItem) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            items: state.items.map((item) => 
              item.id === id ? { ...item, ...updatedItem } : item
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Update inventory error:', error);
          set({ error: error.message || 'Failed to update inventory', isLoading: false });
        }
      },
      
      deleteItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Delete inventory error:', error);
          set({ error: error.message || 'Failed to delete inventory', isLoading: false });
        }
      },
      
      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'inventory-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('Inventory store: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('Inventory store: Rehydration failed', error);
          } else {
            console.log('Inventory store: Rehydration complete');
          }
        };
      },
    }
  )
);
