import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem } from '@/types';

// Mock inventory data
const initialInventoryItems: InventoryItem[] = [
  {
    id: '1',
    jobName: 'Riverside Apartments',
    jobNumber: 'PRJ-2023-001',
    manufacturerOrderNumber: 'MO-12345',
    itemType: 'windows',
    quantity: 24,
    notes: 'Double-pane, energy efficient',
    dateAdded: '2023-09-15',
    addedBy: 'user1',
  },
  {
    id: '2',
    jobName: 'Riverside Apartments',
    jobNumber: 'PRJ-2023-001',
    manufacturerOrderNumber: 'MO-12346',
    itemType: 'siding',
    quantity: 150,
    notes: 'Vinyl, beige color',
    dateAdded: '2023-09-15',
    addedBy: 'user1',
  },
  {
    id: '3',
    jobName: 'Highland Office Complex',
    jobNumber: 'PRJ-2023-002',
    manufacturerOrderNumber: 'MO-23456',
    itemType: 'entry_doors',
    quantity: 12,
    notes: 'Commercial grade, fire-rated',
    dateAdded: '2023-10-02',
    addedBy: 'user2',
  },
  {
    id: '4',
    jobName: 'Oakwood Residential',
    jobNumber: 'PRJ-2023-003',
    manufacturerOrderNumber: 'MO-34567',
    itemType: 'windows',
    quantity: 36,
    notes: 'Casement style, white frame',
    dateAdded: '2023-10-10',
    addedBy: 'user1',
  },
];

interface InventoryState {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => void;
  updateItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => InventoryItem | undefined;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: initialInventoryItems,
      
      addItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: Date.now().toString(),
          dateAdded: new Date().toISOString().split('T')[0],
        };
        
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },
      
      updateItem: (id, updatedItem) => {
        set((state) => ({
          items: state.items.map((item) => 
            item.id === id ? { ...item, ...updatedItem } : item
          ),
        }));
      },
      
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'inventory-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);