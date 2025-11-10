import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type {
  // Form Template operations
  CreateAnamnesisForm,
  UpdateAnamnesisForm,
  GetAnamnesisForm,
  ListAnamnesisForms,
  DeleteAnamnesisForm,
  DuplicateAnamnesisForm,
  
  // Client Submission operations
  CreateClientAnamnesis,
  UpdateClientAnamnesis,
  GetClientAnamnesis,
  ListClientAnamnesis,
  SignClientAnamnesis,
  GenerateAnamnesisPDF,
  GetClientAnamnesisHistory
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type CreateAnamnesisFormInput = {
  salonId: string;
  name: string;
  description?: string;
  formData: any; // JSON structure with form fields
  requireSignature?: boolean;
  requireWitnessSignature?: boolean;
  serviceCategories?: string[];
  isDefault?: boolean;
};

type CreateClientAnamnesisInput = {
  clientId: string;
  salonId: string;
  formId: string;
  formData: any;
  appointmentId?: string;
};

type SignClientAnamnesisInput = {
  anamnesisId: string;
  salonId: string;
  signatureType: 'CLIENT' | 'WITNESS' | 'STAFF';
  signature: string; // Base64 or URL
  signerName?: string;
};

// ============================================================================
// Form Template Operations
// ============================================================================

export const createAnamnesisForm: CreateAnamnesisForm<CreateAnamnesisFormInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'anamnesis:manage');

  const form = await context.entities.AnamnesisForm.create({
    data: {
      salonId: args.salonId,
      createdBy: context.user.id,
      name: args.name,
      description: args.description,
      formData: args.formData,
      isActive: true,
      isDefault: args.isDefault || false,
      isTemplate: false,
      requireSignature: args.requireSignature !== false,
      requireWitnessSignature: args.requireWitnessSignature || false,
      serviceCategories: args.serviceCategories || [],
      usageCount: 0
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return form;
};

export const updateAnamnesisForm: UpdateAnamnesisForm<CreateAnamnesisFormInput & {
  formId: string;
  isActive?: boolean;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'anamnesis:manage');

  // Increment version for major changes
  const existingForm = await context.entities.AnamnesisForm.findUnique({
    where: { id: args.formId }
  });

  if (!existingForm) {
    throw new HttpError(404, 'Form not found');
  }

  const form = await context.entities.AnamnesisForm.update({
    where: {
      id: args.formId
    },
    data: {
      name: args.name,
      description: args.description,
      formData: args.formData,
      isActive: args.isActive,
      isDefault: args.isDefault,
      requireSignature: args.requireSignature,
      requireWitnessSignature: args.requireWitnessSignature,
      serviceCategories: args.serviceCategories,
      version: existingForm.version + 1
    }
  });

  return form;
};

export const getAnamnesisForm: GetAnamnesisForm<{
  formId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'anamnesis:view');

  const form = await context.entities.AnamnesisForm.findFirst({
    where: {
      id: args.formId,
      salonId: args.salonId,
      deletedAt: null
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          submissions: true
        }
      }
    }
  });

  if (!form) {
    throw new HttpError(404, 'Form not found');
  }

  return form;
};

export const listAnamnesisForms: ListAnamnesisForms<{
  salonId: string;
  isActive?: boolean;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'anamnesis:view');

  const where: any = {
    salonId: args.salonId,
    deletedAt: null
  };

  if (args.isActive !== undefined) {
    where.isActive = args.isActive;
  }

  const forms = await context.entities.AnamnesisForm.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          submissions: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return forms;
};

export const deleteAnamnesisForm: DeleteAnamnesisForm<{
  formId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'anamnesis:manage');

  const form = await context.entities.AnamnesisForm.update({
    where: {
      id: args.formId
    },
    data: {
      deletedAt: new Date(),
      isActive: false
    }
  });

  return form;
};

export const duplicateAnamnesisForm: DuplicateAnamnesisForm<{
  formId: string;
  salonId: string;
  newName: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'anamnesis:manage');

  const originalForm = await context.entities.AnamnesisForm.findUnique({
    where: { id: args.formId }
  });

  if (!originalForm) {
    throw new HttpError(404, 'Form not found');
  }

  const newForm = await context.entities.AnamnesisForm.create({
    data: {
      salonId: args.salonId,
      createdBy: context.user.id,
      name: args.newName,
      description: originalForm.description,
      formData: originalForm.formData,
      isActive: true,
      isDefault: false,
      isTemplate: false,
      requireSignature: originalForm.requireSignature,
      requireWitnessSignature: originalForm.requireWitnessSignature,
      serviceCategories: originalForm.serviceCategories,
      usageCount: 0
    }
  });

  return newForm;
};

// ============================================================================
// Client Submission Operations
// ============================================================================

export const createClientAnamnesis: CreateClientAnamnesis<CreateClientAnamnesisInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:manage');

  // Get form to check requirements
  const form = await context.entities.AnamnesisForm.findUnique({
    where: { id: args.formId }
  });

  if (!form) {
    throw new HttpError(404, 'Form not found');
  }

  const anamnesis = await context.entities.ClientAnamnesis.create({
    data: {
      clientId: args.clientId,
      salonId: args.salonId,
      formId: args.formId,
      filledBy: context.user.id,
      formData: args.formData,
      status: 'DRAFT',
      appointmentId: args.appointmentId
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      form: {
        select: {
          id: true,
          name: true
        }
      },
      filler: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Increment form usage count
  await context.entities.AnamnesisForm.update({
    where: { id: args.formId },
    data: {
      usageCount: {
        increment: 1
      }
    }
  });

  return anamnesis;
};

export const updateClientAnamnesis: UpdateClientAnamnesis<{
  anamnesisId: string;
  salonId: string;
  formData?: any;
  status?: 'DRAFT' | 'COMPLETED' | 'SIGNED' | 'ARCHIVED';
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:manage');

  const updateData: any = {};

  if (args.formData) {
    updateData.formData = args.formData;
  }

  if (args.status) {
    updateData.status = args.status;
    if (args.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
  }

  const anamnesis = await context.entities.ClientAnamnesis.update({
    where: {
      id: args.anamnesisId
    },
    data: updateData,
    include: {
      client: {
        select: {
          id: true,
          name: true
        }
      },
      form: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return anamnesis;
};

export const getClientAnamnesis: GetClientAnamnesis<{
  anamnesisId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const anamnesis = await context.entities.ClientAnamnesis.findFirst({
    where: {
      id: args.anamnesisId,
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
      form: true,
      filler: {
        select: {
          id: true,
          name: true
        }
      },
      appointment: {
        select: {
          id: true,
          startAt: true
        }
      }
    }
  });

  if (!anamnesis) {
    throw new HttpError(404, 'Anamnesis not found');
  }

  return anamnesis;
};

export const listClientAnamnesis: ListClientAnamnesis<{
  clientId: string;
  salonId: string;
  status?: string;
  page?: number;
  perPage?: number;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const page = args.page || 1;
  const perPage = args.perPage || 20;
  const skip = (page - 1) * perPage;

  const where: any = {
    clientId: args.clientId,
    salonId: args.salonId,
    deletedAt: null
  };

  if (args.status) {
    where.status = args.status;
  }

  const [anamnesisList, total] = await Promise.all([
    context.entities.ClientAnamnesis.findMany({
      where,
      include: {
        form: {
          select: {
            id: true,
            name: true
          }
        },
        filler: {
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
    context.entities.ClientAnamnesis.count({ where })
  ]);

  return {
    anamnesisList,
    total,
    page,
    perPage
  };
};

export const signClientAnamnesis: SignClientAnamnesis<SignClientAnamnesisInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:manage');

  const updateData: any = {};

  if (args.signatureType === 'CLIENT') {
    updateData.clientSignature = args.signature;
    updateData.clientSignedAt = new Date();
  } else if (args.signatureType === 'WITNESS') {
    updateData.witnessSignature = args.signature;
    updateData.witnessName = args.signerName;
    updateData.witnessSignedAt = new Date();
  } else if (args.signatureType === 'STAFF') {
    updateData.staffSignature = args.signature;
    updateData.staffName = args.signerName || context.user.name;
    updateData.staffSignedAt = new Date();
  }

  // Check if all required signatures are collected
  const anamnesis = await context.entities.ClientAnamnesis.findUnique({
    where: { id: args.anamnesisId },
    include: {
      form: true
    }
  });

  if (!anamnesis) {
    throw new HttpError(404, 'Anamnesis not found');
  }

  let newStatus = anamnesis.status;
  const hasClientSignature = args.signatureType === 'CLIENT' || anamnesis.clientSignature;
  const hasWitnessSignature = args.signatureType === 'WITNESS' || anamnesis.witnessSignature || !anamnesis.form.requireWitnessSignature;

  if (hasClientSignature && hasWitnessSignature) {
    newStatus = 'SIGNED';
    updateData.completedAt = new Date();
  } else if (anamnesis.status === 'DRAFT') {
    newStatus = 'COMPLETED';
  }

  updateData.status = newStatus;

  const updatedAnamnesis = await context.entities.ClientAnamnesis.update({
    where: {
      id: args.anamnesisId
    },
    data: updateData
  });

  return updatedAnamnesis;
};

export const generateAnamnesisPDF: GenerateAnamnesisPDF<{
  anamnesisId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const anamnesis = await context.entities.ClientAnamnesis.findFirst({
    where: {
      id: args.anamnesisId,
      salonId: args.salonId
    },
    include: {
      client: true,
      form: true,
      filler: true
    }
  });

  if (!anamnesis) {
    throw new HttpError(404, 'Anamnesis not found');
  }

  // TODO: Implement PDF generation logic
  // This would typically use a service like Puppeteer or PDFKit
  const pdfUrl = `https://storage.example.com/anamnesis/${args.anamnesisId}.pdf`;

  await context.entities.ClientAnamnesis.update({
    where: {
      id: args.anamnesisId
    },
    data: {
      pdfUrl,
      pdfGeneratedAt: new Date()
    }
  });

  return {
    pdfUrl,
    generatedAt: new Date()
  };
};

export const getClientAnamnesisHistory: GetClientAnamnesisHistory<{
  clientId: string;
  salonId: string;
}, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be authenticated');
  }

  await requirePermission(context, args.salonId, 'clients:view');

  const history = await context.entities.ClientAnamnesis.findMany({
    where: {
      clientId: args.clientId,
      salonId: args.salonId,
      deletedAt: null,
      status: { in: ['SIGNED', 'ARCHIVED'] }
    },
    include: {
      form: {
        select: {
          id: true,
          name: true,
          version: true
        }
      },
      filler: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      completedAt: 'desc'
    }
  });

  return history;
};
