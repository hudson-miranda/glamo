import { HttpError } from 'wasp/server';
import type { 
  CreateContactMessage, 
  GetContactMessages,
  UpdateContactMessageStatus,
  MarkContactMessageAsRead 
} from 'wasp/server/operations';
import {
  createContactMessageSchema,
  getContactMessagesSchema,
  updateContactMessageStatusSchema,
  markContactMessageAsReadSchema,
  ContactMessageStatus,
  type CreateContactMessageInput,
  type GetContactMessagesInput,
  type UpdateContactMessageStatusInput,
  type MarkContactMessageAsReadInput,
  type GetContactMessagesResponse,
  type ContactFormMessageWithUser,
} from './types';

// ============================================================================
// Action: Create Contact Message (público, sem auth requerida)
// ============================================================================

/**
 * Cria uma nova mensagem de contato.
 * Esta action é pública e não requer autenticação, permitindo que visitantes
 * do site enviem mensagens através do formulário de contato da landing page.
 * 
 * Features:
 * - Validação robusta com Zod
 * - Rate limiting básico (previne spam)
 * - Conecta automaticamente ao usuário se estiver logado
 * 
 * @param input - Dados da mensagem (name, email, message)
 * @param context - Contexto do Wasp (entities, user, etc.)
 * @returns A mensagem criada
 * @throws HttpError(400) - Dados inválidos
 * @throws HttpError(429) - Muitas tentativas (rate limit)
 */
export const createContactMessage: CreateContactMessage<
  CreateContactMessageInput,
  ContactFormMessageWithUser
> = async (input, context) => {
  // 1. Validação com Zod
  const validationResult = createContactMessageSchema.safeParse(input);
  
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new HttpError(400, firstError.message);
  }

  const { name, email, message } = validationResult.data;

  // 2. Rate Limiting - Prevenir spam (máx 3 mensagens por email em 1 hora)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentMessagesCount = await context.entities.ContactFormMessage.count({
    where: {
      email,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  if (recentMessagesCount >= 3) {
    throw new HttpError(
      429,
      'Muitas tentativas. Por favor, aguarde antes de enviar outra mensagem.'
    );
  }

  // 3. Criar mensagem
  const contactMessage = await context.entities.ContactFormMessage.create({
    data: {
      name,
      email,
      message,
      status: ContactMessageStatus.NEW,
      userId: context.user?.id || null, // Conecta ao usuário se estiver logado
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
  });

  // 4. TODO: Enviar notificações (opcional)
  // - Enviar email de confirmação para o usuário
  // - Notificar admins sobre nova mensagem
  // Implementar em emailService.ts separado

  console.log(`📧 Nova mensagem de contato recebida de: ${email}`);

  return contactMessage as ContactFormMessageWithUser;
};

// ============================================================================
// Query: Get Contact Messages (admin only)
// ============================================================================

/**
 * Busca mensagens de contato com paginação e filtros.
 * Apenas administradores podem acessar esta query.
 * 
 * @param input - Filtros (status, page, limit)
 * @param context - Contexto do Wasp
 * @returns Lista paginada de mensagens
 * @throws HttpError(403) - Usuário não é admin
 */
export const getContactMessages: GetContactMessages<
  GetContactMessagesInput,
  GetContactMessagesResponse
> = async (input, context) => {
  // 1. Verificar permissão de admin
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar logado');
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Apenas administradores podem acessar as mensagens de contato');
  }

  // 2. Validação com valores padrão
  const validationResult = getContactMessagesSchema.safeParse(input);
  
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new HttpError(400, firstError.message);
  }

  const { status, page, limit } = validationResult.data;

  // 3. Construir filtros
  const where: any = {};
  if (status) {
    where.status = status;
  }

  // 4. Calcular offset para paginação
  const offset = (page - 1) * limit;

  // 5. Buscar mensagens e total em paralelo
  const [messages, total] = await Promise.all([
    context.entities.ContactFormMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    context.entities.ContactFormMessage.count({ where }),
  ]);

  // 6. Calcular total de páginas
  const totalPages = Math.ceil(total / limit);

  return {
    messages: messages as ContactFormMessageWithUser[],
    total,
    page,
    limit,
    totalPages,
  };
};

// ============================================================================
// Action: Update Contact Message Status (admin only)
// ============================================================================

/**
 * Atualiza o status de uma mensagem de contato.
 * Apenas administradores podem atualizar o status.
 * 
 * @param input - ID da mensagem e novo status
 * @param context - Contexto do Wasp
 * @returns A mensagem atualizada
 * @throws HttpError(403) - Usuário não é admin
 * @throws HttpError(404) - Mensagem não encontrada
 */
export const updateContactMessageStatus: UpdateContactMessageStatus<
  UpdateContactMessageStatusInput,
  ContactFormMessageWithUser
> = async (input, context) => {
  // 1. Verificar permissão de admin
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar logado');
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Apenas administradores podem atualizar o status das mensagens');
  }

  // 2. Validação
  const validationResult = updateContactMessageStatusSchema.safeParse(input);
  
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new HttpError(400, firstError.message);
  }

  const { id, status } = validationResult.data;

  // 3. Verificar se mensagem existe
  const existingMessage = await context.entities.ContactFormMessage.findUnique({
    where: { id },
  });

  if (!existingMessage) {
    throw new HttpError(404, 'Mensagem não encontrada');
  }

  // 4. Atualizar status
  const updatedMessage = await context.entities.ContactFormMessage.update({
    where: { id },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  console.log(`✅ Status da mensagem ${id} atualizado para: ${status}`);

  return updatedMessage as ContactFormMessageWithUser;
};

// ============================================================================
// Action: Mark Contact Message as Read (admin only)
// ============================================================================

/**
 * Marca uma mensagem de contato como lida (status = READ).
 * Apenas administradores podem marcar mensagens como lidas.
 * 
 * @param input - ID da mensagem
 * @param context - Contexto do Wasp
 * @returns A mensagem atualizada
 * @throws HttpError(403) - Usuário não é admin
 * @throws HttpError(404) - Mensagem não encontrada
 */
export const markContactMessageAsRead: MarkContactMessageAsRead<
  MarkContactMessageAsReadInput,
  ContactFormMessageWithUser
> = async (input, context) => {
  // 1. Verificar permissão de admin
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar logado');
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Apenas administradores podem marcar mensagens como lidas');
  }

  // 2. Validação
  const validationResult = markContactMessageAsReadSchema.safeParse(input);
  
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new HttpError(400, firstError.message);
  }

  const { id } = validationResult.data;

  // 3. Verificar se mensagem existe
  const existingMessage = await context.entities.ContactFormMessage.findUnique({
    where: { id },
  });

  if (!existingMessage) {
    throw new HttpError(404, 'Mensagem não encontrada');
  }

  // 4. Atualizar status para READ (se ainda não foi lida)
  const updatedMessage = await context.entities.ContactFormMessage.update({
    where: { id },
    data: { 
      status: ContactMessageStatus.READ,
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
  });

  console.log(`👁️ Mensagem ${id} marcada como lida`);

  return updatedMessage as ContactFormMessageWithUser;
};
