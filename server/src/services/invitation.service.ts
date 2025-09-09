import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { FarmInvitation, InvitationStatus } from '../entities/FarmInvitation';
import { FarmUser } from '../entities/FarmUser';
import { User } from '../entities/User';
import { Farm } from '../entities/Farm';
import { FarmRole } from '@kuyash/shared';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface CreateInvitationRequest {
  farmId: string;
  inviteeEmail: string;
  inviteeName?: string;
  role: FarmRole;
  message?: string;
  invitedById: string;
}

export interface AcceptInvitationRequest {
  token: string;
  userId: string;
}

export class InvitationService {
  private invitationRepo: Repository<FarmInvitation>;
  private farmUserRepo: Repository<FarmUser>;
  private userRepo: Repository<User>;
  private farmRepo: Repository<Farm>;

  constructor() {
    this.invitationRepo = AppDataSource.getRepository(FarmInvitation);
    this.farmUserRepo = AppDataSource.getRepository(FarmUser);
    this.userRepo = AppDataSource.getRepository(User);
    this.farmRepo = AppDataSource.getRepository(Farm);
  }

  async createInvitation(data: CreateInvitationRequest): Promise<FarmInvitation> {
    // Check if farm exists
    const farm = await this.farmRepo.findOne({ where: { id: data.farmId } });
    if (!farm) {
      throw new Error('Farm not found');
    }

    // Check if inviter has permission (must be owner or manager)
    const inviterFarmUser = await this.farmUserRepo.findOne({
      where: { farmId: data.farmId, userId: data.invitedById, isActive: true }
    });
    
    if (!inviterFarmUser || (inviterFarmUser.role !== FarmRole.OWNER && inviterFarmUser.role !== FarmRole.MANAGER)) {
      throw new Error('Insufficient permissions to send invitations');
    }

    // Check if user is already a member of the farm
    const existingUser = await this.userRepo.findOne({ where: { email: data.inviteeEmail } });
    if (existingUser) {
      const existingMembership = await this.farmUserRepo.findOne({
        where: { farmId: data.farmId, userId: existingUser.id }
      });
      if (existingMembership) {
        throw new Error('User is already a member of this farm');
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await this.invitationRepo.findOne({
      where: {
        farmId: data.farmId,
        inviteeEmail: data.inviteeEmail,
        status: InvitationStatus.PENDING
      }
    });

    if (existingInvitation) {
      throw new Error('Invitation already sent to this email');
    }

    // Create invitation
    const invitation = new FarmInvitation();
    invitation.id = uuidv4();
    invitation.farmId = data.farmId;
    invitation.inviteeEmail = data.inviteeEmail;
    invitation.inviteeName = data.inviteeName;
    invitation.role = data.role;
    invitation.message = data.message;
    invitation.invitedById = data.invitedById;
    invitation.token = crypto.randomBytes(32).toString('hex');
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    invitation.status = InvitationStatus.PENDING;

    return await this.invitationRepo.save(invitation);
  }

  async getInvitationByToken(token: string): Promise<FarmInvitation | null> {
    return await this.invitationRepo.findOne({
      where: { token },
      relations: ['farm', 'invitedBy']
    });
  }

  async acceptInvitation(data: AcceptInvitationRequest): Promise<FarmUser> {
    const invitation = await this.getInvitationByToken(data.token);
    
    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Invitation is no longer valid');
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepo.save(invitation);
      throw new Error('Invitation has expired');
    }

    // Check if user exists
    const user = await this.userRepo.findOne({ where: { id: data.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify email matches
    if (user.email !== invitation.inviteeEmail) {
      throw new Error('Email does not match invitation');
    }

    // Check if user is already a member
    const existingMembership = await this.farmUserRepo.findOne({
      where: { farmId: invitation.farmId, userId: data.userId }
    });

    if (existingMembership) {
      throw new Error('User is already a member of this farm');
    }

    // Create farm membership
    const farmUser = new FarmUser();
    farmUser.id = uuidv4();
    farmUser.farmId = invitation.farmId;
    farmUser.userId = data.userId;
    farmUser.role = invitation.role;
    farmUser.isActive = true;
    farmUser.joinedAt = new Date();
    farmUser.invitedBy = invitation.invitedById;

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.acceptedAt = new Date();
    invitation.acceptedById = data.userId;

    // Save both in a transaction
    await AppDataSource.transaction(async (manager) => {
      await manager.save(farmUser);
      await manager.save(invitation);
    });

    return farmUser;
  }

  async declineInvitation(token: string): Promise<void> {
    const invitation = await this.getInvitationByToken(token);
    
    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Invitation is no longer valid');
    }

    invitation.status = InvitationStatus.DECLINED;
    await this.invitationRepo.save(invitation);
  }

  async getFarmInvitations(farmId: string, userId: string): Promise<FarmInvitation[]> {
    // Check if user has permission to view invitations
    const farmUser = await this.farmUserRepo.findOne({
      where: { farmId, userId, isActive: true }
    });

    if (!farmUser || (farmUser.role !== FarmRole.OWNER && farmUser.role !== FarmRole.MANAGER)) {
      throw new Error('Insufficient permissions to view invitations');
    }

    return await this.invitationRepo.find({
      where: { farmId },
      relations: ['invitedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getUserInvitations(email: string): Promise<FarmInvitation[]> {
    return await this.invitationRepo.find({
      where: {
        inviteeEmail: email,
        status: InvitationStatus.PENDING
      },
      relations: ['farm', 'invitedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId },
      relations: ['farm']
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Check if user has permission to cancel
    const farmUser = await this.farmUserRepo.findOne({
      where: { farmId: invitation.farmId, userId, isActive: true }
    });

    if (!farmUser || (farmUser.role !== FarmRole.OWNER && farmUser.role !== FarmRole.MANAGER)) {
      throw new Error('Insufficient permissions to cancel invitation');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Can only cancel pending invitations');
    }

    await this.invitationRepo.delete(invitationId);
  }

  async cleanupExpiredInvitations(): Promise<void> {
    await this.invitationRepo.update(
      {
        status: InvitationStatus.PENDING,
        expiresAt: new Date()
      },
      {
        status: InvitationStatus.EXPIRED
      }
    );
  }
}