
import type { SendFollowUpMessages } from 'wasp/server/jobs';
import { communicationService } from '../services/communicationService';

/**
 * Follow-up Messages Job
 * 
 * Sends thank you and feedback request messages after appointments.
 * Runs every hour to check for completed appointments from yesterday.
 */
export const sendFollowUpMessages: SendFollowUpMessages<any, any> = async (args, context) => {
  console.log('💬 Starting follow-up messages job...');

  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Find completed appointments from yesterday
    const appointments = await context.entities.Appointment.findMany({
      where: {
        deletedAt: null,
        status: 'COMPLETED',
        endAt: {
          gte: twoDaysAgo,
          lte: yesterday,
        },
        clientId: { not: null },
      },
      include: {
        client: true,
        professional: true,
        salon: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    console.log(`Found ${appointments.length} completed appointments for follow-up`);

    let sent = 0;
    let failed = 0;

    for (const appointment of appointments) {
      if (!appointment.client) continue;

      try {
        // Check if we already sent a follow-up message for this appointment
        const existingFollowUp = await context.entities.CommunicationLog.findFirst({
          where: {
            clientId: appointment.clientId,
            type: 'FOLLOW_UP',
            metadata: {
              path: ['appointmentId'],
              equals: appointment.id,
            },
          },
        });

        if (existingFollowUp) {
          console.log(`Skipping appointment ${appointment.id} - follow-up already sent`);
          continue;
        }

        // Determine preferred channel
        let channel: 'WHATSAPP' | 'EMAIL' | 'SMS' = 'WHATSAPP';
        if (appointment.client.preferredContactMethod === 'EMAIL' && appointment.client.email) {
          channel = 'EMAIL';
        } else if (appointment.client.preferredContactMethod === 'SMS' && appointment.client.phone) {
          channel = 'SMS';
        }

        // Get template variables
        const variables = await communicationService.getClientTemplateVariables(
          appointment.client.id,
          appointment.salonId,
          context
        );

        // Get service names
        const serviceNames = appointment.services.map((s) => s.service.name).join(', ');

        // Follow-up message template
        const messageTemplate = `Olá, {{clientFirstName}}! 💙

Esperamos que tenha gostado do seu atendimento ontem!

Ficamos muito felizes em ter você conosco. ✨

Serviços realizados: ${serviceNames}

Gostaríamos muito de saber sua opinião! 
Como foi sua experiência? Tem alguma sugestão para melhorarmos?

Sua opinião é muito importante para nós! 🌟

Responda esta mensagem ou nos dê sua avaliação:
⭐⭐⭐⭐⭐

Estamos ansiosos para vê-la novamente! 

Com carinho,
Equipe {{salonName}}
📞 {{salonPhone}}`;

        const message = communicationService.replaceTemplateVariables(
          messageTemplate,
          variables
        );

        // Send follow-up
        const result = await communicationService.sendMessage(
          {
            clientId: appointment.client.id,
            salonId: appointment.salonId,
            type: 'FOLLOW_UP',
            channel,
            subject: 'Como foi sua experiência? 💙',
            message,
            recipientPhone: appointment.client.phone || undefined,
            recipientEmail: appointment.client.email || undefined,
            metadata: {
              appointmentId: appointment.id,
            },
          },
          context
        );

        if (result.success) {
          sent++;
        } else {
          failed++;
          console.error(`Failed to send follow-up to ${appointment.client.name}:`, result.error);
        }

        // Small delay to avoid rate limiting
        await delay(500);
      } catch (error) {
        failed++;
        console.error(`Error sending follow-up for appointment ${appointment.id}:`, error);
      }
    }

    console.log(`✅ Follow-up messages completed: ${sent} sent, ${failed} failed`);

    return {
      processed: appointments.length,
      sent,
      failed,
    };
  } catch (error) {
    console.error('Follow-up messages job failed:', error);
    throw error;
  }
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
