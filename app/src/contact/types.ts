import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export enum ContactMessageStatus {
  NEW = 'NEW',
  READ = 'READ',
  REPLIED = 'REPLIED',
  ARCHIVED = 'ARCHIVED',
}

// ============================================================================
// Zod Schemas para Validação
// ============================================================================

/**
 * Schema de validação para criação de mensagem de contato
 */
export const createContactMessageSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  message: z
    .string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres')
    .trim(),
});

/**
 * Schema de validação para buscar mensagens (admin)
 */
export const getContactMessagesSchema = z.object({
  status: z.nativeEnum(ContactMessageStatus).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

/**
 * Schema de validação para atualizar status de mensagem (admin)
 */
export const updateContactMessageStatusSchema = z.object({
  id: z.string().uuid('ID inválido'),
  status: z.nativeEnum(ContactMessageStatus),
});

/**
 * Schema de validação para marcar mensagem como lida (admin)
 */
export const markContactMessageAsReadSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Input para criar mensagem de contato (público, sem auth)
 */
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;

/**
 * Input para buscar mensagens de contato (admin)
 */
export type GetContactMessagesInput = z.infer<typeof getContactMessagesSchema>;

/**
 * Input para atualizar status de mensagem (admin)
 */
export type UpdateContactMessageStatusInput = z.infer<typeof updateContactMessageStatusSchema>;

/**
 * Input para marcar mensagem como lida (admin)
 */
export type MarkContactMessageAsReadInput = z.infer<typeof markContactMessageAsReadSchema>;

/**
 * Response de mensagens de contato com paginação
 */
export type GetContactMessagesResponse = {
  messages: ContactFormMessageWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  [key: string]: any; // Index signature para compatibilidade com SuperJSONObject
}

/**
 * Mensagem de contato com dados do usuário (se houver)
 */
export type ContactFormMessageWithUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  message: string;
  status: ContactMessageStatus;
  userId?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  [key: string]: any; // Index signature para compatibilidade com SuperJSONObject
}
