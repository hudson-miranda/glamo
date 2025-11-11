import type { SalonInvite, User } from 'wasp/entities';
import type {
  GetPendingInvites,
  SendSalonInvite,
  AcceptSalonInvite,
  RejectSalonInvite,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { getEffectivePlan, getPlanLimits } from '../payment/plans';
import { emailSender } from 'wasp/server/email';
import {
  getInviteReceivedEmail,
  getInviteAcceptedEmail,
  getInviteRejectedEmail,
} from './emailTemplates';

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

  return invites.map((invite: any) => ({
    id: invite.id,
    salonName: invite.salon.name,
    roleName: invite.roleTemplate, // Changed from invite.role.name to roleTemplate
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
  roleTemplate: string; // Changed from roleId to roleTemplate (e.g., 'owner', 'manager', etc.)
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

  const { email, roleTemplate } = args;

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

  // Validate roleTemplate (must be one of the system templates)
  const validRoleTemplates = ['owner', 'manager', 'professional', 'cashier', 'assistant', 'client'];
  if (!validRoleTemplates.includes(roleTemplate)) {
    throw new HttpError(400, 'Invalid role template');
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
      roleTemplate,
      invitedBy: context.user.id,
      expiresAt,
    },
    include: {
      salon: {
        select: {
          name: true,
        },
      },
    },
  });

  // Send email notification to invitee
  try {
    const clientUrl = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';
    const acceptUrl = `${clientUrl}/invite/accept/${invite.id}`;
    const rejectUrl = `${clientUrl}/invite/reject/${invite.id}`;

    const emailContent = getInviteReceivedEmail({
      salonName: invite.salon.name,
      roleName: invite.roleTemplate, // Changed from invite.role.name to invite.roleTemplate
      inviterName: context.user.name,
      acceptLink: acceptUrl,
      rejectLink: rejectUrl,
    });

    await emailSender.send({
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  } catch (emailError) {
    console.error('Failed to send invite email:', emailError);
    // Don't throw - invite was created successfully, email is secondary
  }

  return invite;
};

/**
 * Accept a salon invite
 */
type AcceptSalonInviteInput = {
  inviteId: string;
};

export const acceptSalonInvite: AcceptSalonInvite<AcceptSalonInviteInput, void> = async (
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
      salon: {
        select: {
          name: true,
        },
      },
      inviter: {
        select: {
          email: true,
          name: true,
          emailNotifications: true,
        },
      },
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

  // Create UserSalon relationship with roleTemplate
  await context.entities.UserSalon.create({
    data: {
      userId: context.user.id,
      salonId: invite.salonId,
      roleTemplate: invite.roleTemplate,
      primaryPermissions: 0, // Uses roleTemplate defaults
      secondaryPermissions: 0,
      isActive: true,
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
  if (!context.user.activeSalonId) {
    await context.entities.User.update({
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
      after: {},
    },
  });

  // Send email notification to inviter (if they have notifications enabled)
  if (invite.inviter?.emailNotifications && invite.inviter?.email) {
    try {
      const clientUrl = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';
      const dashboardUrl = `${clientUrl}/employees`;

      const emailContent = getInviteAcceptedEmail({
        salonName: invite.salon.name,
        userName: context.user.name || context.user.email || 'Usuário',
        userEmail: context.user.email || '',
        roleName: invite.roleTemplate, // Changed from invite.role.name to invite.roleTemplate
        dashboardLink: dashboardUrl,
      });

      await emailSender.send({
        to: invite.inviter.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error('Failed to send invite accepted email:', emailError);
      // Don't throw - action was successful, email is secondary
    }
  }
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
    include: {
      salon: {
        select: {
          name: true,
        },
      },
      inviter: {
        select: {
          email: true,
          name: true,
          emailNotifications: true,
        },
      },
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
      after: {},
    },
  });

  // Send email notification to inviter (if they have notifications enabled)
  if (invite.inviter?.emailNotifications && invite.inviter?.email) {
    try {
      const clientUrl = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';
      const dashboardUrl = `${clientUrl}/employees`;

      const emailContent = getInviteRejectedEmail({
        salonName: invite.salon.name,
        userEmail: context.user.email || 'usuário',
        roleName: invite.roleTemplate, // Changed from invite.role.name to invite.roleTemplate
        dashboardLink: dashboardUrl,
      });

      await emailSender.send({
        to: invite.inviter.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error('Failed to send invite rejected email:', emailError);
      // Don't throw - action was successful, email is secondary
    }
  }
};
