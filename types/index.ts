// Common types used across the app

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'field' | 'office' | 'sales';
  crewId?: string;
  avatar?: string;
};

export type Crew = {
  id: string;
  name: string;
  members: User[];
  projects: string[];
  schedule?: {
    id: string;
    date: string;
    location: string;
    description: string;
  }[];
};

export type Project = {
  id: string;
  name: string;
  number: string;
  status: 'pending' | 'active' | 'completed' | 'on-hold';
  client: string;
  startDate: string;
  endDate?: string;
  crews: string[];
  budget: number;
  location: string;
  tasks?: Task[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }[];
};

export type PayrollEntry = {
  employeeId: string;
  employeeName: string;
  jobId: string;
  jobName: string;
  date: string;
  amount: number;
};

export type InventoryItem = {
  id: string;
  jobName: string;
  jobNumber: string;
  manufacturerOrderNumber: string;
  itemType: 'windows' | 'siding' | 'security_doors' | 'entry_doors' | 'other';
  quantity: number;
  notes?: string;
  dateAdded: string;
  addedBy: string;
};

export type ProductType = 'windows' | 'siding' | 'security_doors' | 'entry_doors' | 'other';

export type WindowSeries = 'sliding' | 'hung' | 'casement' | 'awning' | 'fixed';

export type WindowOperation = 'XO' | 'OX' | 'XOX' | 'OXO' | 'XX';

export type WindowConfig = {
  id: string;
  type: 'windows';
  series: WindowSeries;
  width: number;
  height: number;
  operation: WindowOperation;
  frameColor: string;
  glassType: string;
  hardware: string;
  screenType: string;
  price: number;
};

export type ProductConfig = WindowConfig | {
  id: string;
  type: ProductType;
  // Other product specific properties
  price: number;
};

export type Quote = {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  date: string;
  items: ProductConfig[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdBy: string;
};

export type Task = {
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
};

export type PunchListItem = {
  id: string;
  projectId: string;
  description: string;
  location: string;
  status: 'open' | 'in_progress' | 'completed';
  assignedTo?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
};

export type MaterialRequest = {
  id: string;
  projectId: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  requestedBy: string;
  status: 'pending' | 'approved' | 'delivered';
  requestDate: string;
  deliveryDate?: string;
};