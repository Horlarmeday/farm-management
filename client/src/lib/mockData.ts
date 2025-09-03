import {
  ActivityItem,
  AlertItem,
  FinanceItem,
  InventoryStatus,
  SavedReport,
  TaskItem,
} from './types';

// This file contains static UI data that doesn't come from the API
// Used for demo purposes and default states

export const alertsData: AlertItem[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Low Feed Stock',
    description: 'Poultry feed below minimum threshold',
    color: 'red',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    type: 'info',
    title: 'Vaccination Due',
    description: 'Batch #B2024-001 vaccination scheduled',
    color: 'yellow',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 3,
    type: 'info',
    title: 'Water Quality Check',
    description: 'Pond #3 requires pH monitoring',
    color: 'blue',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
];

export const activitiesData: ActivityItem[] = [
  {
    id: 1,
    text: 'Added new poultry batch',
    time: '2 hours ago',
    color: 'bg-primary',
    module: 'poultry',
  },
  {
    id: 2,
    text: 'Updated water quality - Pond #5',
    time: '4 hours ago',
    color: 'bg-blue-500',
    module: 'fishery',
  },
  {
    id: 3,
    text: 'Completed vaccination schedule',
    time: '6 hours ago',
    color: 'bg-green-500',
    module: 'livestock',
  },
  {
    id: 4,
    text: 'Feed inventory updated',
    time: '8 hours ago',
    color: 'bg-yellow-500',
    module: 'inventory',
  },
];

export const tasksData: TaskItem[] = [
  {
    id: 1,
    text: 'Feed Layer House A',
    completed: false,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    priority: 'high',
  },
  {
    id: 2,
    text: 'Check Pond pH levels',
    completed: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    priority: 'medium',
  },
  {
    id: 3,
    text: 'Collect eggs from House B',
    completed: true,
    priority: 'high',
  },
  {
    id: 4,
    text: 'Vaccinate Batch #B2024-003',
    completed: false,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    priority: 'medium',
  },
];

export const inventoryStatusData: InventoryStatus[] = [
  {
    label: 'Feed Stock',
    status: 'Low',
    color: 'text-red-600',
    currentStock: 150,
    reorderLevel: 200,
  },
  {
    label: 'Medicines',
    status: 'Good',
    color: 'text-green-600',
    currentStock: 50,
    reorderLevel: 20,
  },
  {
    label: 'Equipment',
    status: 'Medium',
    color: 'text-yellow-600',
    currentStock: 30,
    reorderLevel: 15,
  },
];

export const financeItemsData: FinanceItem[] = [
  {
    label: 'Monthly Revenue',
    value: '₦2.45M',
    color: 'text-green-600',
    change: { value: '+12%', positive: true },
  },
  {
    label: 'Expenses',
    value: '₦1.82M',
    color: 'text-red-600',
    change: { value: '+8%', positive: false },
  },
  {
    label: 'Net Profit',
    value: '₦630K',
    color: 'text-primary',
    change: { value: '+18%', positive: true },
  },
];

export const quickStatsData = [
  {
    label: 'Feed Consumption',
    value: '2,840 kg',
    progress: 75,
    color: 'bg-primary',
  },
  {
    label: 'Mortality Rate',
    value: '2.1%',
    progress: 8,
    color: 'bg-green-500',
  },
  {
    label: 'Production Efficiency',
    value: '89%',
    progress: 89,
    color: 'bg-blue-500',
  },
];

export const savedReportsData: SavedReport[] = [
  {
    name: 'Monthly Performance Summary',
    description: 'Complete overview of farm performance for the current month',
    lastGenerated: '2024-01-15',
    status: 'ready',
  },
  {
    name: 'Annual Financial Statement',
    description: 'Yearly financial report with profit/loss analysis',
    lastGenerated: '2024-01-01',
    status: 'ready',
  },
  {
    name: 'Livestock Health Report',
    description: 'Health status and vaccination records for all livestock',
    lastGenerated: '2024-01-10',
    status: 'pending',
  },
  {
    name: 'Feed Consumption Analysis',
    description: 'Feed usage patterns and efficiency metrics',
    lastGenerated: '2024-01-12',
    status: 'ready',
  },
];

export const moduleImages = {
  poultry:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200',
  livestock:
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200',
  fishery:
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200',
  inventory:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200',
  finance:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200',
  hr: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=200',
};

// Chart data for analytics
export const revenueChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [1200000, 1350000, 1800000, 2100000, 2450000, 2200000],
      borderColor: 'hsl(142, 71%, 45%)',
      backgroundColor: 'hsl(142, 71%, 45%, 0.1)',
      fill: true,
    },
  ],
};

export const productionChartData = {
  labels: ['Poultry', 'Livestock', 'Fishery', 'Others'],
  datasets: [
    {
      label: 'Production Value',
      data: [45, 25, 20, 10],
      backgroundColor: [
        'hsl(45, 93%, 47%)',
        'hsl(271, 91%, 65%)',
        'hsl(207, 90%, 54%)',
        'hsl(142, 71%, 45%)',
      ],
    },
  ],
};

// Navigation items for different user roles
export const navigationItems = [
  { name: 'Dashboard', href: '/', icon: 'Home' },
  { name: 'Poultry', href: '/poultry', icon: 'Bird' },
  { name: 'Livestock', href: '/livestock', icon: 'Cow' },
  { name: 'Fishery', href: '/fishery', icon: 'Fish' },
  { name: 'Assets', href: '/assets', icon: 'Wrench' },
  { name: 'Inventory', href: '/inventory', icon: 'Package' },
  { name: 'Finance', href: '/finance', icon: 'DollarSign' },
  { name: 'Reports', href: '/reports', icon: 'FileText' },
];

// Form validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  date: 'Please select a valid date',
  number: 'Please enter a valid number',
  positive: 'Value must be greater than 0',
  future: 'Date must be in the future',
  past: 'Date must be in the past',
};

// Status color mappings
export const statusColors = {
  active: 'farm-status-success',
  inactive: 'farm-status-warning',
  sold: 'farm-status-info',
  dead: 'farm-status-danger',
  culled: 'farm-status-danger',
  good: 'farm-status-success',
  medium: 'farm-status-warning',
  low: 'farm-status-danger',
  ready: 'farm-status-success',
  pending: 'farm-status-warning',
  error: 'farm-status-danger',
};

// Dashboard stats mock data
export const dashboardStats = {
  totalRevenue: 2450000,
  activeBirds: 8500,
  fishHarvest: 1250,
  livestock: 523,
  monthlyRevenue: 2450000,
  monthlyExpenses: 1820000,
  netProfit: 630000,
  feedConsumption: 2840,
  mortalityRate: 2.1,
  productionEfficiency: 89,
  eggProduction: 6240,
  milkProduction: 1840,
  pondCount: 8,
  activePonds: 6,
  employeeCount: 24,
  pendingTasks: 12,
  completedTasks: 156,
  lowStockItems: 3,
  alerts: 5,
  recentActivities: 8,
};

export const mockAnimals = [
  {
    id: 1,
    tagNumber: 'L001',
    species: 'cattle',
    breed: 'Holstein',
    gender: 'female',
    dateOfBirth: '2019-03-15',
    acquisitionDate: '2019-06-01',
    source: 'Local Market',
    status: 'alive',
  },
  {
    id: 2,
    tagNumber: 'L002',
    species: 'goat',
    breed: 'Boer',
    gender: 'male',
    dateOfBirth: '2020-07-10',
    acquisitionDate: '2020-09-20',
    source: 'Neighboring Farm',
    status: 'alive',
  },
  {
    id: 3,
    tagNumber: 'L003',
    species: 'sheep',
    breed: 'Dorper',
    gender: 'female',
    dateOfBirth: '2021-01-05',
    acquisitionDate: '2021-03-15',
    source: 'Auction',
    status: 'sold',
  },
];
