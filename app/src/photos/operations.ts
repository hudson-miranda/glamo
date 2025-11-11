import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  UploadClientPhoto,
  UpdateClientPhoto,
  DeleteClientPhoto,
  GetClientPhotos,
  GetClientPhoto,
  CreateBeforeAfterPair,
  SearchClientPhotos,
  GetPhotoGallery,
  UpdatePhotoApproval
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type UploadClientPhotoInput = {
  clientId: string;
  salonId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  photoType?: 'GENERAL' | 'BEFORE' | 'AFTER' | 'PROGRESS' | 'PORTFOLIO' | 'RESULT';
  category?: string;
  title?: string;
  description?: string;
  tags?: string[];
  takenAt?: string;
  appointmentId?: string;
  serviceIds?: string[];
  isPublic?: boolean;
  showInGallery?: boolean;
};

type UpdateClientPhotoInput = {
  photoId: string;
  salonId: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  photoType?: string;
  isPublic?: boolean;
  showInGallery?: boolean;
  clientApproved?: boolean;
};

type CreateBeforeAfterPairInput = {
  salonId: string;
  clientId: string;
  beforePhotoId: string;
  afterPhotoId: string;
  appointmentId?: string;
};

type SearchClientPhotosInput = {
  salonId: string;
  clientId?: string;
  search?: string;
  photoType?: string;
  category?: string;
  tags?: string[];
  appointmentId?: string;
  isPublic?: boolean;
  showInGallery?: boolean;
  page?: number;
  perPage?: number;
};

// ============================================================================
// Client Photo Operations
// ============================================================================

export const uploadClientPhoto: UploadClientPhoto<UploadClientPhotoInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:manage', context.entities);

  const photo = await context.entities.ClientPhoto.create({
    data: {
      clientId: args.clientId,
      salonId: args.salonId,
      uploadedBy: context.user.id,
      fileUrl: args.fileUrl,
      thumbnailUrl: args.thumbnailUrl,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      width: args.width,
      height: args.height,
      photoType: args.photoType || 'GENERAL',
      category: args.category,
      title: args.title,
      description: args.description,
      tags: args.tags || [],
      takenAt: args.takenAt ? new Date(args.takenAt) : null,
      appointmentId: args.appointmentId,
      serviceIds: args.serviceIds || [],
      isPublic: args.isPublic || false,
      showInGallery: args.showInGallery !== false,
      clientApproved: false,
      aiTags: [],
      aiDescription: null
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      uploader: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return photo;
};

export const updateClientPhoto: UpdateClientPhoto<UpdateClientPhotoInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:manage', context.entities);

  const photo = await context.entities.ClientPhoto.update({
    where: {
      id: args.photoId
    },
    data: {
      title: args.title,
      description: args.description,
      tags: args.tags,
      category: args.category,
      photoType: args.photoType as any,
      isPublic: args.isPublic,
      showInGallery: args.showInGallery,
      clientApproved: args.clientApproved
    },
    include: {
      client: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return photo;
};

export const deleteClientPhoto: DeleteClientPhoto<{
  photoId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:manage', context.entities);

  const photo = await context.entities.ClientPhoto.update({
    where: {
      id: args.photoId
    },
    data: {
      deletedAt: new Date()
    }
  });

  return photo;
};

export const getClientPhoto: GetClientPhoto<{
  photoId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:view', context.entities);

  const photo = await context.entities.ClientPhoto.findFirst({
    where: {
      id: args.photoId,
      salonId: args.salonId,
      deletedAt: null
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      uploader: {
        select: {
          id: true,
          name: true
        }
      },
      appointment: {
        select: {
          id: true,
          startAt: true,
          endAt: true
        }
      }
    }
  });

  if (!photo) {
    throw new HttpError(404, 'Photo not found');
  }

  return photo;
};

export const getClientPhotos: GetClientPhotos<{
  clientId: string;
  salonId: string;
  photoType?: string;
  page?: number;
  perPage?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:view', context.entities);

  const page = args.page || 1;
  const perPage = args.perPage || 20;
  const skip = (page - 1) * perPage;

  const where: any = {
    clientId: args.clientId,
    salonId: args.salonId,
    deletedAt: null
  };

  if (args.photoType) {
    where.photoType = args.photoType;
  }

  const [photos, total] = await Promise.all([
    context.entities.ClientPhoto.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        uploader: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        takenAt: 'desc'
      },
      skip,
      take: perPage
    }),
    context.entities.ClientPhoto.count({ where })
  ]);

  return {
    photos,
    total,
    page,
    perPage
  };
};

export const createBeforeAfterPair: CreateBeforeAfterPair<CreateBeforeAfterPairInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:manage', context.entities);

  // Generate unique pair ID
  const pairId = `pair_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Update both photos
  const [beforePhoto, afterPhoto] = await Promise.all([
    context.entities.ClientPhoto.update({
      where: { id: args.beforePhotoId },
      data: {
        photoType: 'BEFORE',
        isBeforeAfter: true,
        beforeAfterPairId: pairId,
        position: 'BEFORE',
        appointmentId: args.appointmentId
      }
    }),
    context.entities.ClientPhoto.update({
      where: { id: args.afterPhotoId },
      data: {
        photoType: 'AFTER',
        isBeforeAfter: true,
        beforeAfterPairId: pairId,
        position: 'AFTER',
        appointmentId: args.appointmentId
      }
    })
  ]);

  return {
    pairId,
    beforePhoto,
    afterPhoto
  };
};

export const searchClientPhotos: SearchClientPhotos<SearchClientPhotosInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:view', context.entities);

  const page = args.page || 1;
  const perPage = args.perPage || 20;
  const skip = (page - 1) * perPage;

  const where: any = {
    salonId: args.salonId,
    deletedAt: null
  };

  if (args.clientId) {
    where.clientId = args.clientId;
  }

  if (args.photoType) {
    where.photoType = args.photoType;
  }

  if (args.category) {
    where.category = args.category;
  }

  if (args.appointmentId) {
    where.appointmentId = args.appointmentId;
  }

  if (args.isPublic !== undefined) {
    where.isPublic = args.isPublic;
  }

  if (args.showInGallery !== undefined) {
    where.showInGallery = args.showInGallery;
  }

  if (args.search) {
    where.OR = [
      { title: { contains: args.search, mode: 'insensitive' } },
      { description: { contains: args.search, mode: 'insensitive' } },
      { tags: { has: args.search } },
      { client: { name: { contains: args.search, mode: 'insensitive' } } }
    ];
  }

  if (args.tags && args.tags.length > 0) {
    where.tags = {
      hasSome: args.tags
    };
  }

  const [photos, total] = await Promise.all([
    context.entities.ClientPhoto.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true
          }
        },
        uploader: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: perPage
    }),
    context.entities.ClientPhoto.count({ where })
  ]);

  return {
    photos,
    total,
    page,
    perPage
  };
};

export const getPhotoGallery: GetPhotoGallery<{
  salonId: string;
  publicOnly?: boolean;
  beforeAfterOnly?: boolean;
  category?: string;
  page?: number;
  perPage?: number;
}, any> = async (args, context) => {
  const page = args.page || 1;
  const perPage = args.perPage || 30;
  const skip = (page - 1) * perPage;

  const where: any = {
    salonId: args.salonId,
    deletedAt: null,
    showInGallery: true
  };

  if (args.publicOnly) {
    where.isPublic = true;
    where.clientApproved = true;
  }

  if (args.beforeAfterOnly) {
    where.isBeforeAfter = true;
  }

  if (args.category) {
    where.category = args.category;
  }

  const [photos, total] = await Promise.all([
    context.entities.ClientPhoto.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        takenAt: 'desc'
      },
      skip,
      take: perPage
    }),
    context.entities.ClientPhoto.count({ where })
  ]);

  // Group before/after pairs
  const grouped: any = {
    beforeAfterPairs: [],
    singlePhotos: []
  };

  const processedPairs = new Set();

  photos.forEach(photo => {
    if (photo.isBeforeAfter && photo.beforeAfterPairId && !processedPairs.has(photo.beforeAfterPairId)) {
      const pair = photos.filter(p => p.beforeAfterPairId === photo.beforeAfterPairId);
      if (pair.length === 2) {
        grouped.beforeAfterPairs.push({
          pairId: photo.beforeAfterPairId,
          before: pair.find(p => p.position === 'BEFORE'),
          after: pair.find(p => p.position === 'AFTER')
        });
        processedPairs.add(photo.beforeAfterPairId);
      }
    } else if (!photo.isBeforeAfter) {
      grouped.singlePhotos.push(photo);
    }
  });

  return {
    ...grouped,
    total,
    page,
    perPage
  };
};

export const updatePhotoApproval: UpdatePhotoApproval<{
  photoId: string;
  salonId: string;
  clientApproved: boolean;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context.user, args.salonId, 'clients:manage', context.entities);

  const photo = await context.entities.ClientPhoto.update({
    where: {
      id: args.photoId
    },
    data: {
      clientApproved: args.clientApproved
    }
  });

  return photo;
};
