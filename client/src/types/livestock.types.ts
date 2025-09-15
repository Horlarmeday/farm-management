export interface Animal {
  id: string;
  farmId: string;
  name?: string;
  type: string;
  breed?: string;
  gender?: 'male' | 'female';
  birthDate?: Date;
  weight?: number;
  healthStatus: 'healthy' | 'sick' | 'quarantine' | 'deceased';
  location?: string;
  managedBy?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LivestockGroup {
  id: string;
  farmId: string;
  name: string;
  type: string;
  breed?: string;
  count: number;
  averageWeight?: number;
  healthStatus: 'healthy' | 'sick' | 'quarantine';
  location?: string;
  managedBy?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnimalRequest {
  farmId: string;
  name?: string;
  type: string;
  breed?: string;
  gender?: 'male' | 'female';
  birthDate?: Date;
  weight?: number;
  location?: string;
  managedBy?: string;
  notes?: string;
}

export interface UpdateAnimalRequest extends Partial<CreateAnimalRequest> {
  healthStatus?: 'healthy' | 'sick' | 'quarantine' | 'deceased';
  isActive?: boolean;
}