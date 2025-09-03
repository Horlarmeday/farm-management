import { z } from 'zod';

// Animal schema
export const insertAnimalSchema = z.object({
  tagNumber: z.string().min(1, 'Tag number is required'),
  species: z.enum([
    'cattle',
    'goat',
    'sheep',
    'pig',
    'buffalo',
    'donkey',
    'horse',
    'rabbit',
    'chicken',
    'duck',
    'turkey',
    'guinea_fowl',
    'other',
  ]),
  breed: z.string().min(1, 'Breed is required'),
  gender: z.enum(['male', 'female']),
  dateOfBirth: z.date().optional(),
  acquisitionDate: z.date(),
  acquisitionSource: z.string().min(1, 'Acquisition source is required'),
  supplier: z.string().optional(),
  parentMaleId: z.string().optional(),
  parentFemaleId: z.string().optional(),
  currentWeight: z.number().optional(),
  targetWeight: z.number().optional(),
  locationId: z.string().min(1, 'Location is required'),
  acquisitionCost: z.number().min(0, 'Cost must be positive'),
  notes: z.string().optional(),
});

// Bird batch schema
export const insertBirdBatchSchema = z.object({
  batchCode: z.string().min(1, 'Batch code is required'),
  birdType: z.enum(['layer', 'broiler', 'breeder']),
  breed: z.string().min(1, 'Breed is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  arrivalDate: z.date(),
  source: z.string().optional(),
  houseLocation: z.string().optional(),
  status: z.enum(['active', 'sold', 'culled']).default('active'),
});

// Inventory item schema
export const insertInventoryItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  category: z.enum(['feed', 'medicine', 'tools', 'equipment', 'supplies']),
  unit: z.string().min(1, 'Unit is required'),
  reorderLevel: z.number().min(0, 'Reorder level must be positive'),
  currentStock: z.number().min(0, 'Current stock must be positive').default(0),
  expiryDate: z.date().optional(),
  supplier: z.string().optional(),
});

// Form schemas (simplified for UI)
export const createAnimalFormSchema = z.object({
  tagNumber: z.string().min(1, 'Tag number is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.number().min(0, 'Age must be positive'),
  weight: z.number().min(0, 'Weight must be positive'),
  gender: z.enum(['male', 'female']),
  purpose: z.enum(['dairy', 'meat', 'breeding', 'draft']),
  status: z.enum(['healthy', 'sick', 'quarantine', 'treatment']),
  notes: z.string().optional(),
});

export const createBirdBatchFormSchema = z.object({
  batchCode: z.string().min(1, 'Batch code is required'),
  birdType: z.enum(['layer', 'broiler', 'breeder']),
  breed: z.string().min(1, 'Breed is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  arrivalDate: z.date(),
  source: z.string().optional(),
  houseLocation: z.string().optional(),
});

export const createInventoryItemFormSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  category: z.enum(['feed', 'medicine', 'tools', 'equipment', 'supplies']),
  unit: z.string().min(1, 'Unit is required'),
  reorderLevel: z.number().min(0, 'Reorder level must be positive'),
  currentStock: z.number().min(0, 'Current stock must be positive'),
  expiryDate: z.date().optional(),
  supplier: z.string().optional(),
});
