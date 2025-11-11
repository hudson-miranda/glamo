import type { User } from 'wasp/entities';
import type {
  ListEmployees,
  UpdateEmployeeRole,
  DeactivateEmployee,
  ResendInvite,
  CancelInvite,
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { requirePermission } from '../rbac/requirePermission';
import { emailSender } from 'wasp/server/email';
import { getInviteReceivedEmail } from './emailTemplates';

/**
 * List all employees (active UserSalon records) for the current salon
 */
export const listEmployees: ListEmployees<
  void,
  Array<{
    id: string;
    userId: string;
    userName: string | null;
    userEmail: string | null;
    roleTemplate: string; // Changed from roles array to single roleTemplate
    isActive: boolean;
    createdAt: Date;
  }>
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  if (!context.user.activeSalonId) {
    throw new HttpError(400, 'No active salon selected');
  }

  // Check permission
  await requirePermission(
    context.user,
    context.user.activeSalonId,
    'can_view_staff',
    context.entities
  );

  const employees = await context.entities.UserSalon.findMany({
    where: {
      salonId: context.user.activeSalonId,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { isActive: 'desc' }, // Active first
      { createdAt: 'desc' },
    ],
  });

  return employees.map((emp: any) => ({
    id: emp.id,
    userId: emp.user.id,
    userName: emp.user.name,
    userEmail: emp.user.email,
    roleTemplate: emp.roleTemplate,
    isActive: emp.isActive,
    createdAt: emp.createdAt,
  }));
};

/**
 * Update an employee's role in the salon
 */
type UpdateEmployeeRoleInput = {
  userSalonId: string;
  newRoleTemplate: string; // Changed from newRoleId to newRoleTemplate
};

export const updateEmployeeRole: UpdateEmployeeRole<UpdateEmployeeRoleInput, void> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  if (!context.user.activeSalonId) {
    throw new HttpError(400, 'No active salon selected');
  }

  const { userSalonId, newRoleTemplate } = args;

  // Check permission
  await requirePermission(
    context.user,
    context.user.activeSalonId,
    'can_edit_staff',
    context.entities
  );

  // Verify the UserSalon belongs to the active salon
  const userSalon = await context.entities.UserSalon.findUnique({
    where: { id: userSalonId },
    include: {
      user: true,
    },
  });

  if (!userSalon || userSalon.salonId !== context.user.activeSalonId) {
    throw new HttpError(404, 'Employee not found in this salon');
  }

  // Prevent self role change if user is owner
  const currentUserIsOwner = userSalon.userId === context.user.id;
  if (currentUserIsOwner && userSalon.roleTemplate === 'owner' && newRoleTemplate !== 'owner') {
    throw new HttpError(403, 'Owners cannot change their own role');
  }

  // Validate roleTemplate
  const validRoleTemplates = ['owner', 'manager', 'professional', 'cashier', 'assistant', 'client'];
  if (!validRoleTemplates.includes(newRoleTemplate)) {
    throw new HttpError(400, 'Invalid role template');
  }

  // Update UserSalon with new roleTemplate
  await context.entities.UserSalon.update({
    where: { id: userSalonId },
    data: {
      roleTemplate: newRoleTemplate,
      // Reset custom permissions when changing role template
      primaryPermissions: 0,
      secondaryPermissions: 0,
    },
  });

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'UserSalon',
      entityId: userSalonId,
      action: 'UPDATE_ROLE',
      before: {
        roleTemplate: userSalon.roleTemplate,
      },
      after: {
        roleTemplate: newRoleTemplate,
      },
    },
  });
};

/**
 * Deactivate an employee (set isActive = false)
 */
type DeactivateEmployeeInput = {
  userSalonId: string;
};

export const deactivateEmployee: DeactivateEmployee<DeactivateEmployeeInput, void> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  if (!context.user.activeSalonId) {
    throw new HttpError(400, 'No active salon selected');
  }

  const { userSalonId } = args;

  // Check permission
  await requirePermission(
    context.user,
    context.user.activeSalonId,
    'can_remove_staff',
    context.entities
  );

  // Verify the UserSalon belongs to the active salon
  const userSalon = await context.entities.UserSalon.findUnique({
    where: { id: userSalonId },
  });

  if (!userSalon || userSalon.salonId !== context.user.activeSalonId) {
    throw new HttpError(404, 'Employee not found in this salon');
  }

  // Prevent deactivating owner
  if (userSalon.roleTemplate === 'owner') {
    throw new HttpError(403, 'Cannot deactivate salon owner');
  }

  // Prevent self-deactivation
  if (userSalon.userId === context.user.id) {
    throw new HttpError(403, 'Cannot deactivate yourself');
  }

  // Deactivate
  await context.entities.UserSalon.update({
    where: { id: userSalonId },
    data: { isActive: false },
  });

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'UserSalon',
      entityId: userSalonId,
      action: 'DEACTIVATE',
      before: { isActive: true },
      after: { isActive: false },
    },
  });
};

/**
 * Resend an invite that is still pending
 */
type ResendInviteInput = {
  inviteId: string;
};

export const resendInvite: ResendInvite<ResendInviteInput, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  if (!context.user.activeSalonId) {
    throw new HttpError(400, 'No active salon selected');
  }

  const { inviteId } = args;

  // Check permission
  await requirePermission(
    context.user,
    context.user.activeSalonId,
    'can_invite_staff',
    context.entities
  );

  // Verify invite exists and belongs to this salon
  const invite = await context.entities.SalonInvite.findUnique({
    where: { id: inviteId },
    include: {
      salon: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!invite || invite.salonId !== context.user.activeSalonId) {
    throw new HttpError(404, 'Invite not found');
  }

  if (invite.status !== 'PENDING') {
    throw new HttpError(400, 'Can only resend pending invites');
  }

  // Update expiration date (extend by 7 days from now)
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7);

  await context.entities.SalonInvite.update({
    where: { id: inviteId },
    data: {
      expiresAt: newExpiresAt,
      updatedAt: new Date(),
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
      to: invite.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  } catch (emailError) {
    console.error('Failed to resend invite email:', emailError);
    // Don't throw - invite was updated successfully, email is secondary
  }

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'SalonInvite',
      entityId: inviteId,
      action: 'RESEND',
      before: { expiresAt: invite.expiresAt },
      after: { expiresAt: newExpiresAt },
    },
  });

  // TODO: Send email notification (will be implemented in email notifications task)
};

/**
 * Cancel a pending invite
 */
type CancelInviteInput = {
  inviteId: string;
};

export const cancelInvite: CancelInvite<CancelInviteInput, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  if (!context.user.activeSalonId) {
    throw new HttpError(400, 'No active salon selected');
  }

  const { inviteId } = args;

  // Check permission
  await requirePermission(
    context.user,
    context.user.activeSalonId,
    'can_invite_staff',
    context.entities
  );

  // Verify invite exists and belongs to this salon
  const invite = await context.entities.SalonInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite || invite.salonId !== context.user.activeSalonId) {
    throw new HttpError(404, 'Invite not found');
  }

  if (invite.status !== 'PENDING') {
    throw new HttpError(400, 'Can only cancel pending invites');
  }

  // Update status to REJECTED (we don't have a CANCELLED status, using REJECTED)
  await context.entities.SalonInvite.update({
    where: { id: inviteId },
    data: {
      status: 'REJECTED',
      updatedAt: new Date(),
    },
  });

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'SalonInvite',
      entityId: inviteId,
      action: 'CANCEL',
      before: { status: 'PENDING' },
      after: { status: 'REJECTED' },
    },
  });
};
