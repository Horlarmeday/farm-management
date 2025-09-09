import { Request, Response } from 'express';
import { InvitationService, CreateInvitationRequest, AcceptInvitationRequest } from '../services/invitation.service';
import { FarmRole } from '@kuyash/shared';
import { body, param, validationResult } from 'express-validator';

export class InvitationController {
  private invitationService: InvitationService;

  constructor() {
    this.invitationService = new InvitationService();
  }

  // Validation rules
  static createInvitationValidation = [
    body('inviteeEmail').isEmail().withMessage('Valid email is required'),
    body('role').isIn(Object.values(FarmRole)).withMessage('Valid role is required'),
    body('inviteeName').optional().isString().withMessage('Invitee name must be a string'),
    body('message').optional().isString().withMessage('Message must be a string')
  ];

  static acceptInvitationValidation = [
    param('token').isString().notEmpty().withMessage('Token is required')
  ];

  static declineInvitationValidation = [
    param('token').isString().notEmpty().withMessage('Token is required')
  ];

  static cancelInvitationValidation = [
    param('invitationId').isUUID().withMessage('Valid invitation ID is required')
  ];

  createInvitation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { inviteeEmail, role, inviteeName, message } = req.body;
      const farmId = req.headers['x-farm-id'] as string;
      const userId = req.user?.id;

      if (!farmId) {
        res.status(400).json({ error: 'Farm ID is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const invitationData: CreateInvitationRequest = {
        farmId,
        inviteeEmail,
        role,
        inviteeName,
        message,
        invitedById: userId
      };

      const invitation = await this.invitationService.createInvitation(invitationData);

      res.status(201).json({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation.id,
          inviteeEmail: invitation.inviteeEmail,
          inviteeName: invitation.inviteeName,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create invitation' });
    }
  };

  getInvitationDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      const invitation = await this.invitationService.getInvitationByToken(token);

      if (!invitation) {
        res.status(404).json({ error: 'Invitation not found' });
        return;
      }

      if (invitation.expiresAt < new Date()) {
        res.status(410).json({ error: 'Invitation has expired' });
        return;
      }

      res.json({
        invitation: {
          id: invitation.id,
          farmName: invitation.farm.name,
          farmDescription: invitation.farm.description,
          inviteeEmail: invitation.inviteeEmail,
          inviteeName: invitation.inviteeName,
          role: invitation.role,
          message: invitation.message,
          invitedBy: {
            name: invitation.invitedBy.name,
            email: invitation.invitedBy.email
          },
          expiresAt: invitation.expiresAt,
          status: invitation.status
        }
      });
    } catch (error) {
      console.error('Error getting invitation details:', error);
      res.status(500).json({ error: 'Failed to get invitation details' });
    }
  };

  acceptInvitation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { token } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const acceptData: AcceptInvitationRequest = {
        token,
        userId
      };

      const farmUser = await this.invitationService.acceptInvitation(acceptData);

      res.json({
        message: 'Invitation accepted successfully',
        farmMembership: {
          farmId: farmUser.farmId,
          role: farmUser.role,
          joinedAt: farmUser.joinedAt
        }
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to accept invitation' });
    }
  };

  declineInvitation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { token } = req.params;

      await this.invitationService.declineInvitation(token);

      res.json({ message: 'Invitation declined successfully' });
    } catch (error) {
      console.error('Error declining invitation:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to decline invitation' });
    }
  };

  getFarmInvitations = async (req: Request, res: Response): Promise<void> => {
    try {
      const farmId = req.headers['x-farm-id'] as string;
      const userId = req.user?.id;

      if (!farmId) {
        res.status(400).json({ error: 'Farm ID is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const invitations = await this.invitationService.getFarmInvitations(farmId, userId);

      res.json({
        invitations: invitations.map(inv => ({
          id: inv.id,
          inviteeEmail: inv.inviteeEmail,
          inviteeName: inv.inviteeName,
          role: inv.role,
          status: inv.status,
          message: inv.message,
          invitedBy: {
            name: inv.invitedBy.name,
            email: inv.invitedBy.email
          },
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt
        }))
      });
    } catch (error) {
      console.error('Error getting farm invitations:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to get farm invitations' });
    }
  };

  getUserInvitations = async (req: Request, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email;

      if (!userEmail) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const invitations = await this.invitationService.getUserInvitations(userEmail);

      res.json({
        invitations: invitations.map(inv => ({
          id: inv.id,
          token: inv.token,
          farmName: inv.farm.name,
          farmDescription: inv.farm.description,
          role: inv.role,
          message: inv.message,
          invitedBy: {
            name: inv.invitedBy.name,
            email: inv.invitedBy.email
          },
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt
        }))
      });
    } catch (error) {
      console.error('Error getting user invitations:', error);
      res.status(500).json({ error: 'Failed to get user invitations' });
    }
  };

  cancelInvitation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { invitationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await this.invitationService.cancelInvitation(invitationId, userId);

      res.json({ message: 'Invitation cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to cancel invitation' });
    }
  };
}