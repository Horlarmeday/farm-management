import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireFarmAccess } from '../middleware/farm-auth';
import { FarmRole } from '../../../shared/src/types';

const router = Router();
const invitationController = new InvitationController();

// Public route - get invitation details by token (for invitation preview)
router.get('/invitation/:token', invitationController.getInvitationDetails);

// Public route - accept invitation by token (user must be authenticated)
router.post('/invitation/:token/accept', 
  authenticate,
  InvitationController.acceptInvitationValidation,
  invitationController.acceptInvitation
);

// Public route - decline invitation by token
router.post('/invitation/:token/decline',
  InvitationController.declineInvitationValidation,
  invitationController.declineInvitation
);

// Protected routes - require authentication
router.use(authenticate);

// Get user's pending invitations
router.get('/user/invitations', invitationController.getUserInvitations);

// Farm-specific routes - require farm access
router.use(requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]));

// Create invitation (only owners and managers can invite)
router.post('/farm/invitations',
  InvitationController.createInvitationValidation,
  invitationController.createInvitation
);

// Get farm invitations (only owners and managers can view)
router.get('/farm/invitations', invitationController.getFarmInvitations);

// Cancel invitation (only owners and managers can cancel)
router.delete('/farm/invitations/:invitationId',
  InvitationController.cancelInvitationValidation,
  invitationController.cancelInvitation
);

export default router;