
import type {
  CommunicationLog,
  MarketingCampaign,
  ClientSegment,
  CampaignTemplate,
  Prisma,
} from '@prisma/client';
import { HttpError } from 'wasp/server';
import { communicationService } from './services/communicationService';

// ============================================================================
// COMMUNICATION LOG OPERATIONS
// ============================================================================

/**
 * List communication logs with filtering and pagination
 */
export const listCommunicationLogs = async (
  args: {
    clientId?: string;
    salonId?: string;
    type?: string;
    channel?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  },
  context: any
): Promise<{
  communications: CommunicationLog[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: Prisma.CommunicationLogWhereInput = {
    deletedAt: null,
  };

  if (args.clientId) {
    where.clientId = args.clientId;
  }

  if (args.salonId) {
    where.salonId = args.salonId;
  }

  if (args.type) {
    where.type = args.type as any;
  }

  if (args.channel) {
    where.channel = args.channel as any;
  }

  if (args.status) {
    where.status = args.status as any;
  }

  // Get total count
  const total = await context.entities.CommunicationLog.count({ where });

  // Get paginated results
  const communications = await context.entities.CommunicationLog.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  return {
    communications,
    total,
    page,
    pageSize,
  };
};

/**
 * Get a single communication log by ID
 */
export const getCommunicationLog = async (
  args: { id: string },
  context: any
): Promise<CommunicationLog> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const communicationLog = await context.entities.CommunicationLog.findUnique({
    where: { id: args.id },
    include: {
      client: true,
      user: true,
      campaign: true,
    },
  });

  if (!communicationLog) {
    throw new HttpError(404, 'Communication log not found');
  }

  return communicationLog;
};

/**
 * Send a manual message to a client
 */
export const sendManualMessage = async (
  args: {
    clientId: string;
    salonId: string;
    channel: string;
    subject?: string;
    message: string;
  },
  context: any
): Promise<{ success: boolean; communicationLogId?: string; error?: string }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  // Get client info
  const client = await context.entities.Client.findUnique({
    where: { id: args.clientId },
  });

  if (!client) {
    throw new HttpError(404, 'Client not found');
  }

  // Validate channel-specific recipient info
  if ((args.channel === 'WHATSAPP' || args.channel === 'SMS') && !client.phone) {
    throw new HttpError(400, 'Client has no phone number');
  }

  if (args.channel === 'EMAIL' && !client.email) {
    throw new HttpError(400, 'Client has no email address');
  }

  // Send message
  const result = await communicationService.sendMessage(
    {
      clientId: args.clientId,
      salonId: args.salonId,
      userId: context.user.id,
      type: 'CUSTOM_MESSAGE',
      channel: args.channel as any,
      subject: args.subject,
      message: args.message,
      recipientPhone: client.phone || undefined,
      recipientEmail: client.email || undefined,
    },
    context
  );

  return result;
};

// ============================================================================
// CAMPAIGN OPERATIONS
// ============================================================================

/**
 * List marketing campaigns
 */
export const listCampaigns = async (
  args: {
    salonId?: string;
    type?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  },
  context: any
): Promise<{
  campaigns: MarketingCampaign[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.MarketingCampaignWhereInput = {};

  if (args.salonId) {
    where.salonId = args.salonId;
  }

  if (args.type) {
    where.type = args.type as any;
  }

  if (args.status) {
    where.status = args.status as any;
  }

  const total = await context.entities.MarketingCampaign.count({ where });

  const campaigns = await context.entities.MarketingCampaign.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      segment: {
        select: {
          id: true,
          name: true,
          clientCount: true,
        },
      },
    },
  });

  return {
    campaigns,
    total,
    page,
    pageSize,
  };
};

/**
 * Get a single campaign by ID
 */
export const getCampaign = async (
  args: { id: string },
  context: any
): Promise<MarketingCampaign> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const campaign = await context.entities.MarketingCampaign.findUnique({
    where: { id: args.id },
    include: {
      creator: true,
      segment: true,
      communications: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!campaign) {
    throw new HttpError(404, 'Campaign not found');
  }

  return campaign;
};

/**
 * Create a marketing campaign
 */
export const createCampaign = async (
  args: {
    salonId: string;
    name: string;
    description?: string;
    type: string;
    segmentId?: string;
    targetClientIds?: string[];
    subject?: string;
    messageTemplate: string;
    channel: string;
    scheduledAt?: Date;
  },
  context: any
): Promise<MarketingCampaign> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  // Calculate target count
  let targetCount = 0;
  if (args.segmentId) {
    const segment = await context.entities.ClientSegment.findUnique({
      where: { id: args.segmentId },
    });
    targetCount = segment?.clientCount || 0;
  } else if (args.targetClientIds) {
    targetCount = args.targetClientIds.length;
  }

  const campaign = await context.entities.MarketingCampaign.create({
    data: {
      salonId: args.salonId,
      name: args.name,
      description: args.description,
      type: args.type as any,
      status: args.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      segmentId: args.segmentId,
      targetClientIds: args.targetClientIds || [],
      subject: args.subject,
      messageTemplate: args.messageTemplate,
      channel: args.channel as any,
      scheduledAt: args.scheduledAt,
      targetCount,
      createdBy: context.user.id,
    },
  });

  return campaign;
};

/**
 * Update a campaign
 */
export const updateCampaign = async (
  args: {
    id: string;
    name?: string;
    description?: string;
    segmentId?: string;
    targetClientIds?: string[];
    subject?: string;
    messageTemplate?: string;
    scheduledAt?: Date;
  },
  context: any
): Promise<MarketingCampaign> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const campaign = await context.entities.MarketingCampaign.findUnique({
    where: { id: args.id },
  });

  if (!campaign) {
    throw new HttpError(404, 'Campaign not found');
  }

  // Can't edit campaigns that are sending or completed
  if (['SENDING', 'COMPLETED'].includes(campaign.status)) {
    throw new HttpError(400, 'Cannot edit campaign in current status');
  }

  const updateData: any = {};

  if (args.name) updateData.name = args.name;
  if (args.description !== undefined) updateData.description = args.description;
  if (args.segmentId !== undefined) updateData.segmentId = args.segmentId;
  if (args.targetClientIds !== undefined) updateData.targetClientIds = args.targetClientIds;
  if (args.subject !== undefined) updateData.subject = args.subject;
  if (args.messageTemplate !== undefined) updateData.messageTemplate = args.messageTemplate;
  if (args.scheduledAt !== undefined) {
    updateData.scheduledAt = args.scheduledAt;
    updateData.status = args.scheduledAt ? 'SCHEDULED' : 'DRAFT';
  }

  const updated = await context.entities.MarketingCampaign.update({
    where: { id: args.id },
    data: updateData,
  });

  return updated;
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (
  args: { id: string },
  context: any
): Promise<{ success: boolean }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const campaign = await context.entities.MarketingCampaign.findUnique({
    where: { id: args.id },
  });

  if (!campaign) {
    throw new HttpError(404, 'Campaign not found');
  }

  // Can't delete campaigns that are sending or completed
  if (['SENDING', 'COMPLETED'].includes(campaign.status)) {
    throw new HttpError(400, 'Cannot delete campaign in current status');
  }

  await context.entities.MarketingCampaign.delete({
    where: { id: args.id },
  });

  return { success: true };
};

// ============================================================================
// SEGMENT OPERATIONS
// ============================================================================

/**
 * List client segments
 */
export const listSegments = async (
  args: {
    salonId?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  },
  context: any
): Promise<{
  segments: ClientSegment[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ClientSegmentWhereInput = {};

  if (args.salonId) {
    where.salonId = args.salonId;
  }

  if (args.isActive !== undefined) {
    where.isActive = args.isActive;
  }

  const total = await context.entities.ClientSegment.count({ where });

  const segments = await context.entities.ClientSegment.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    segments,
    total,
    page,
    pageSize,
  };
};

/**
 * Get a single segment by ID
 */
export const getSegment = async (
  args: { id: string },
  context: any
): Promise<ClientSegment> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const segment = await context.entities.ClientSegment.findUnique({
    where: { id: args.id },
    include: {
      creator: true,
      campaigns: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!segment) {
    throw new HttpError(404, 'Segment not found');
  }

  return segment;
};

/**
 * Create a client segment
 */
export const createSegment = async (
  args: {
    salonId: string;
    name: string;
    description?: string;
    criteria: any;
  },
  context: any
): Promise<ClientSegment> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  // Calculate client count based on criteria
  const clientCount = await evaluateSegmentCriteria(args.criteria, args.salonId, context);

  const segment = await context.entities.ClientSegment.create({
    data: {
      salonId: args.salonId,
      name: args.name,
      description: args.description,
      criteria: args.criteria,
      clientCount,
      lastCalculatedAt: new Date(),
      createdBy: context.user.id,
    },
  });

  return segment;
};

/**
 * Update a segment
 */
export const updateSegment = async (
  args: {
    id: string;
    name?: string;
    description?: string;
    criteria?: any;
    isActive?: boolean;
  },
  context: any
): Promise<ClientSegment> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const segment = await context.entities.ClientSegment.findUnique({
    where: { id: args.id },
  });

  if (!segment) {
    throw new HttpError(404, 'Segment not found');
  }

  const updateData: any = {};

  if (args.name) updateData.name = args.name;
  if (args.description !== undefined) updateData.description = args.description;
  if (args.isActive !== undefined) updateData.isActive = args.isActive;
  
  if (args.criteria) {
    updateData.criteria = args.criteria;
    updateData.clientCount = await evaluateSegmentCriteria(
      args.criteria,
      segment.salonId,
      context
    );
    updateData.lastCalculatedAt = new Date();
  }

  const updated = await context.entities.ClientSegment.update({
    where: { id: args.id },
    data: updateData,
  });

  return updated;
};

/**
 * Delete a segment
 */
export const deleteSegment = async (
  args: { id: string },
  context: any
): Promise<{ success: boolean }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  await context.entities.ClientSegment.delete({
    where: { id: args.id },
  });

  return { success: true };
};

/**
 * Evaluate segment criteria and return matching client IDs
 */
export const evaluateSegment = async (
  args: { segmentId: string },
  context: any
): Promise<{ clientIds: string[]; count: number }> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const segment = await context.entities.ClientSegment.findUnique({
    where: { id: args.segmentId },
  });

  if (!segment) {
    throw new HttpError(404, 'Segment not found');
  }

  const where = buildWhereClauseFromCriteria(segment.criteria);
  where.salonId = segment.salonId;
  where.deletedAt = null;

  const clients = await context.entities.Client.findMany({
    where,
    select: { id: true },
  });

  return {
    clientIds: clients.map((c) => c.id),
    count: clients.length,
  };
};

// ============================================================================
// CAMPAIGN TEMPLATE OPERATIONS
// ============================================================================

/**
 * List campaign templates
 */
export const listCampaignTemplates = async (
  args: {
    salonId?: string;
    type?: string;
    isSystem?: boolean;
  },
  context: any
): Promise<CampaignTemplate[]> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const where: Prisma.CampaignTemplateWhereInput = {
    isActive: true,
  };

  // Show system templates + salon-specific templates
  if (args.salonId) {
    where.OR = [
      { salonId: args.salonId },
      { isSystem: true },
    ];
  } else if (args.isSystem) {
    where.isSystem = true;
  }

  if (args.type) {
    where.type = args.type as any;
  }

  const templates = await context.entities.CampaignTemplate.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return templates;
};

/**
 * Create a campaign template
 */
export const createCampaignTemplate = async (
  args: {
    salonId?: string;
    name: string;
    description?: string;
    type: string;
    channel: string;
    subject?: string;
    messageTemplate: string;
    placeholders?: string[];
  },
  context: any
): Promise<CampaignTemplate> => {
  if (!context.user) {
    throw new HttpError(401, 'Unauthorized');
  }

  const template = await context.entities.CampaignTemplate.create({
    data: {
      salonId: args.salonId,
      name: args.name,
      description: args.description,
      type: args.type as any,
      channel: args.channel as any,
      subject: args.subject,
      messageTemplate: args.messageTemplate,
      placeholders: args.placeholders || [],
      createdBy: context.user.id,
    },
  });

  return template;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build Prisma where clause from segment criteria
 */
function buildWhereClauseFromCriteria(criteria: any): Prisma.ClientWhereInput {
  const where: Prisma.ClientWhereInput = {};

  if (!criteria.rules || !Array.isArray(criteria.rules)) {
    return where;
  }

  const conditions: any[] = [];

  for (const rule of criteria.rules) {
    const condition: any = {};

    switch (rule.operator) {
      case 'eq':
        condition[rule.field] = rule.value;
        break;
      case 'ne':
        condition[rule.field] = { not: rule.value };
        break;
      case 'gt':
        condition[rule.field] = { gt: rule.value };
        break;
      case 'gte':
        condition[rule.field] = { gte: rule.value };
        break;
      case 'lt':
        condition[rule.field] = { lt: rule.value };
        break;
      case 'lte':
        condition[rule.field] = { lte: rule.value };
        break;
      case 'contains':
        condition[rule.field] = { contains: rule.value, mode: 'insensitive' };
        break;
      case 'in':
        condition[rule.field] = { in: rule.value };
        break;
      case 'between':
        condition[rule.field] = { gte: rule.value[0], lte: rule.value[1] };
        break;
    }

    conditions.push(condition);
  }

  if (conditions.length > 0) {
    if (criteria.logic === 'OR') {
      where.OR = conditions;
    } else {
      where.AND = conditions;
    }
  }

  return where;
}

/**
 * Evaluate segment criteria and return count
 */
async function evaluateSegmentCriteria(
  criteria: any,
  salonId: string,
  context: any
): Promise<number> {
  const where = buildWhereClauseFromCriteria(criteria);
  where.salonId = salonId;
  where.deletedAt = null;

  const count = await context.entities.Client.count({ where });
  return count;
}
