export enum FarmRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  WORKER = 'worker'
}

export interface Farm {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Export type for runtime usage
export type FarmType = Farm;

export interface FarmUser {
  id: string;
  farmId: string;
  userId: string;
  farm?: Farm;
  role: FarmRole;
  isActive: boolean;
  joinedAt?: Date;
  invitedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFarmRequest {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

export interface UpdateFarmRequest extends Partial<CreateFarmRequest> {
  isActive?: boolean;
}

export interface InviteUserToFarmRequest {
  email: string;
  role: FarmRole;
  notes?: string;
}

export interface FarmInvitation {
  id: string;
  farmId: string;
  email: string;
  role: FarmRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}