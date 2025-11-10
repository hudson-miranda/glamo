
import type { CommunicationChannel, CommunicationLog, Prisma } from '@prisma/client';
import { whatsappService } from './whatsapp';
import { emailService } from './email';
import { smsService } from './sms';

/**
 * Communication Service Orchestrator
 * 
 * This service coordinates sending messages across different channels
 * and logging communication history.
 */

interface SendMessageParams {
  clientId: string;
  salonId: string;
  userId?: string;
  type: string;
  channel: CommunicationChannel;
  subject?: string;
  message: string;
  recipientPhone?: string;
  recipientEmail?: string;
  campaignId?: string;
  metadata?: Record<string, any>;
}

interface SendMessageResult {
  success: boolean;
  communicationLogId?: string;
  error?: string;
}

class CommunicationService {
  /**
   * Send a message through the specified channel
   */
  async sendMessage(
    params: SendMessageParams,
    context: any
  ): Promise<SendMessageResult> {
    try {
      // Validate channel-specific recipient info
      if (params.channel === 'WHATSAPP' || params.channel === 'SMS') {
        if (!params.recipientPhone) {
          throw new Error('Phone number required for WhatsApp/SMS');
        }
      } else if (params.channel === 'EMAIL') {
        if (!params.recipientEmail) {
          throw new Error('Email address required for email channel');
        }
      }

      // Create pending communication log
      const communicationLog = await context.entities.CommunicationLog.create({
        data: {
          clientId: params.clientId,
          salonId: params.salonId,
          userId: params.userId,
          type: params.type,
          channel: params.channel,
          direction: 'OUTBOUND',
          subject: params.subject,
          message: params.message,
          recipientPhone: params.recipientPhone,
          recipientEmail: params.recipientEmail,
          campaignId: params.campaignId,
          status: 'PENDING',
          metadata: params.metadata,
        },
      });

      // Send message through appropriate channel
      let sendResult: any;
      let externalId: string | undefined;
      let cost: number | undefined;

      switch (params.channel) {
        case 'WHATSAPP':
          sendResult = await whatsappService.sendMessage({
            to: params.recipientPhone!,
            message: params.message,
          });
          externalId = sendResult.messageId;
          cost = sendResult.cost;
          break;

        case 'SMS':
          sendResult = await smsService.sendSMS({
            to: params.recipientPhone!,
            message: params.message,
          });
          externalId = sendResult.messageId;
          cost = sendResult.cost;
          break;

        case 'EMAIL':
          sendResult = await emailService.sendEmail({
            to: params.recipientEmail!,
            subject: params.subject || 'Mensagem do Salão',
            message: params.message,
            isHtml: true,
          });
          externalId = sendResult.messageId;
          break;

        default:
          throw new Error(`Unsupported channel: ${params.channel}`);
      }

      // Update communication log with result
      const updatedLog = await context.entities.CommunicationLog.update({
        where: { id: communicationLog.id },
        data: {
          status: sendResult.status,
          sentAt: sendResult.success ? new Date() : null,
          externalId: externalId,
          cost: cost,
          failureReason: sendResult.error,
        },
      });

      return {
        success: sendResult.success,
        communicationLogId: updatedLog.id,
        error: sendResult.error,
      };
    } catch (error) {
      console.error('Communication service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk messages
   */
  async sendBulkMessages(
    messages: SendMessageParams[],
    context: any
  ): Promise<SendMessageResult[]> {
    const results: SendMessageResult[] = [];

    for (const message of messages) {
      const result = await this.sendMessage(message, context);
      results.push(result);

      // Small delay to avoid rate limiting
      await this.delay(500);
    }

    return results;
  }

  /**
   * Replace template variables in message
   */
  replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
  ): string {
    let message = template;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return message;
  }

  /**
   * Get common template variables for a client
   */
  async getClientTemplateVariables(
    clientId: string,
    salonId: string,
    context: any
  ): Promise<Record<string, string>> {
    const client = await context.entities.Client.findUnique({
      where: { id: clientId },
      include: {
        salon: true,
      },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    const firstName = client.name.split(' ')[0];

    return {
      clientName: client.name,
      clientFirstName: firstName,
      clientEmail: client.email || '',
      clientPhone: client.phone || '',
      salonName: client.salon.name,
      salonPhone: client.salon.phone || '',
      salonAddress: client.salon.address || '',
    };
  }

  /**
   * Utility: delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check which channels are configured
   */
  getConfiguredChannels(): CommunicationChannel[] {
    const channels: CommunicationChannel[] = [];

    if (whatsappService.isReady()) channels.push('WHATSAPP');
    if (emailService.isReady()) channels.push('EMAIL');
    if (smsService.isReady()) channels.push('SMS');

    return channels;
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();

// Export types
export type { SendMessageParams, SendMessageResult };
