import type { SalonInvite, User } from 'wasp/entities';
import type {
  GetPendingInvites,
  SendSalonInvite,
  AcceptSalonInvite,
  RejectSalonInvite,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { getEffectivePlan, getPlanLimits } from '../payment/plans';

/**
 * Get all pending invites for the current user's email
 */
export const getPendingInvites: GetPendingInvites<
  void,
  Array<{
    id: string;
    salonName: string;
    roleName: string;
    inviterName: string | null;
    createdAt: Date;
    expiresAt: Date;
  }>
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const invites = await context.entities.SalonInvite.findMany({
    where: {
      email: context.user.email!,
      status: 'PENDING',
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      salon: {
        select: {
          name: true,
        },
      },
      role: {
        select: {
          name: true,
        },
      },
      inviter: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return invites.map((invite) => ({
    id: invite.id,
    salonName: invite.salon.name,
    roleName: invite.role.name,
    inviterName: invite.inviter.name,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
  }));
};

/**
 * Send an invite to a user to join a salon
 */
type SendSalonInviteInput = {
  email: string;
  roleId: string;
};

export const sendSalonInvite: SendSalonInvite<SendSalonInviteInput, SalonInvite> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  if (!context.user.activeSalonId) {
    throw new HttpError(400, 'No active salon selected');
  }

  const { email, roleId } = args;

  // Validate email
  if (!email || !email.includes('@')) {
    throw new HttpError(400, 'Valid email is required');
  }

  // Verify user has permission to invite staff
  const userSalon = await context.entities.UserSalon.findFirst({
    where: {
      userId: context.user.id,
      salonId: context.user.activeSalonId,
      isActive: true,
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userSalon) {
    throw new HttpError(403, 'You do not have access to this salon');
  }

  // Check permission
  const hasPermission = userSalon.userRoles.some((ur) =>
    ur.role.rolePermissions.some((rp) => rp.permission.name === 'can_invite_staff')
  );

  if (!hasPermission) {
    throw new HttpError(403, 'You do not have permission to invite staff');
  }

  // Check plan limits
  const effectivePlan = getEffectivePlan({
    subscriptionPlan: context.user.subscriptionPlan,
    createdAt: context.user.createdAt,
    datePaid: context.user.datePaid,
  });
  const limits = getPlanLimits(effectivePlan);

  // Count current professionals in salon
  const professionalCount = await context.entities.UserSalon.count({
    where: {
      salonId: context.user.activeSalonId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (professionalCount >= limits.maxProfessionalsPerSalon) {
    throw new HttpError(
      403,
      `Your plan allows a maximum of ${limits.maxProfessionalsPerSalon} professionals per salon. Please upgrade your plan.`
    );
  }

  // Verify role exists and belongs to this salon
  const role = await context.entities.Role.findUnique({
    where: { id: roleId },
  });

  if (!role || role.salonId !== context.user.activeSalonId) {
    throw new HttpError(400, 'Invalid role');
  }

  // Check if invite already exists
  const existingInvite = await context.entities.SalonInvite.findFirst({
    where: {
      salonId: context.user.activeSalonId,
      email: email.toLowerCase(),
      status: 'PENDING',
    },
  });

  if (existingInvite) {
    throw new HttpError(400, 'An invite has already been sent to this email');
  }

  // Check if user is already in the salon
  const invitedUser = await context.entities.User.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (invitedUser) {
    const existingUserSalon = await context.entities.UserSalon.findFirst({
      where: {
        userId: invitedUser.id,
        salonId: context.user.activeSalonId,
        isActive: true,
      },
    });

    if (existingUserSalon) {
      throw new HttpError(400, 'This user is already a member of this salon');
    }
  }

  // Create invite (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await context.entities.SalonInvite.create({
    data: {
      salonId: context.user.activeSalonId,
      email: email.toLowerCase(),
      roleId,
      invitedBy: context.user.id,
      expiresAt,
    },
  });

  // TODO: Send email notification
  // This will be implemented later with the email system

  return invite;
};

/**
 * Accept a salon invite
 */
type AcceptSalonInviteInput = {
  inviteId: string;
};

export const acceptSalonInvite: AcceptSalonInvite<AcceptSalonInviteInput, User> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { inviteId } = args;

  // Get invite
  const invite = await context.entities.SalonInvite.findUnique({
    where: { id: inviteId },
    include: {
      salon: true,
      role: true,
    },
  });

  if (!invite) {
    throw new HttpError(404, 'Invite not found');
  }

  // Verify invite belongs to user
  if (invite.email !== context.user.email) {
    throw new HttpError(403, 'This invite is not for you');
  }

  // Verify invite is still valid
  if (invite.status !== 'PENDING') {
    throw new HttpError(400, 'This invite is no longer valid');
  }

  if (new Date() > invite.expiresAt) {
    // Mark as expired
    await context.entities.SalonInvite.update({
      where: { id: inviteId },
      data: { status: 'EXPIRED' },
    });
    throw new HttpError(400, 'This invite has expired');
  }

  // Check if user is already in the salon
  const existingUserSalon = await context.entities.UserSalon.findFirst({
    where: {
      userId: context.user.id,
      salonId: invite.salonId,
    },
  });

  if (existingUserSalon) {
    throw new HttpError(400, 'You are already a member of this salon');
  }

  // Create UserSalon relationship
  const userSalon = await context.entities.UserSalon.create({
    data: {
      userId: context.user.id,
      salonId: invite.salonId,
      isActive: true,
    },
  });

  // Assign role to user
  await context.entities.UserRole.create({
    data: {
      userSalonId: userSalon.id,
      roleId: invite.roleId,
    },
  });

  // Mark invite as accepted
  await context.entities.SalonInvite.update({
    where: { id: inviteId },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  // Set as active salon if user doesn't have one
  let updatedUser = context.user;
  if (!context.user.activeSalonId) {
    updatedUser = await context.entities.User.update({
      where: { id: context.user.id },
      data: { activeSalonId: invite.salonId },
    });
  }

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'SalonInvite',
      entityId: inviteId,
      action: 'ACCEPT',
      after: null,
    },
  });

  return updatedUser;
};

/**
 * Reject a salon invite
 */
type RejectSalonInviteInput = {
  inviteId: string;
};

export const rejectSalonInvite: RejectSalonInvite<RejectSalonInviteInput, void> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { inviteId } = args;

  // Get invite
  const invite = await context.entities.SalonInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) {
    throw new HttpError(404, 'Invite not found');
  }

  // Verify invite belongs to user
  if (invite.email !== context.user.email) {
    throw new HttpError(403, 'This invite is not for you');
  }

  // Verify invite is still valid
  if (invite.status !== 'PENDING') {
    throw new HttpError(400, 'This invite is no longer valid');
  }

  // Mark invite as rejected
  await context.entities.SalonInvite.update({
    where: { id: inviteId },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
    },
  });

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'SalonInvite',
      entityId: inviteId,
      action: 'REJECT',
      after: null,
    },
  });
};
