import * as z from 'zod';
import { HttpError } from 'wasp/server';
import { type File } from 'wasp/entities';
import {
  type CreateFile,
  type GetAllFilesByUser,
  type GetDownloadFileSignedURL,
} from 'wasp/server/operations';

import { getUploadFileSignedURLFromS3, getDownloadFileSignedURLFromS3 } from './s3Utils';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
import { ALLOWED_FILE_TYPES } from './validation';
import { getEffectivePlan, getPlanLimits } from '../payment/plans';

const createFileInputSchema = z.object({
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string().nonempty(),
});

type CreateFileInput = z.infer<typeof createFileInputSchema>;

export const createFile: CreateFile<
  CreateFileInput,
  {
    s3UploadUrl: string;
    s3UploadFields: Record<string, string>;
  }
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { fileType, fileName } = ensureArgsSchemaOrThrowHttpError(createFileInputSchema, rawArgs);

  // TODO: Add storage limit validation when File model has 'size' field
  // const effectivePlan = getEffectivePlan({
  //   subscriptionPlan: context.user.subscriptionPlan,
  //   createdAt: context.user.createdAt,
  //   datePaid: context.user.datePaid,
  // });
  // const limits = getPlanLimits(effectivePlan);
  // 
  // const totalStorageUsed = await context.entities.File.aggregate({
  //   where: { userId: context.user.id },
  //   _sum: { size: true },
  // });
  //
  // if (totalStorageUsed._sum.size >= limits.maxStorageGB * 1024 * 1024 * 1024) {
  //   throw new HttpError(403, `Storage limit reached...`);
  // }

  const { s3UploadUrl, s3UploadFields, key } = await getUploadFileSignedURLFromS3({
    fileType,
    fileName,
    userId: context.user.id,
  });

  await context.entities.File.create({
    data: {
      name: fileName,
      key,
      uploadUrl: s3UploadUrl,
      type: fileType,
      user: { connect: { id: context.user.id } },
    },
  });

  return {
    s3UploadUrl,
    s3UploadFields,
  };
};

export const getAllFilesByUser: GetAllFilesByUser<void, File[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.File.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getDownloadFileSignedURLInputSchema = z.object({ key: z.string().nonempty() });

type GetDownloadFileSignedURLInput = z.infer<typeof getDownloadFileSignedURLInputSchema>;

export const getDownloadFileSignedURL: GetDownloadFileSignedURL<
  GetDownloadFileSignedURLInput,
  string
> = async (rawArgs, _context) => {
  const { key } = ensureArgsSchemaOrThrowHttpError(getDownloadFileSignedURLInputSchema, rawArgs);
  return await getDownloadFileSignedURLFromS3({ key });
};
