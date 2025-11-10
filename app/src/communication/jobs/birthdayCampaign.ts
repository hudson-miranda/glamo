
import type { SendBirthdayCampaigns } from 'wasp/server/jobs';
import { communicationService } from '../services/communicationService';

/**
 * Birthday Campaign Job
 * 
 * Sends birthday greetings to clients whose birthday is today.
 * Runs daily at 9 AM.
 */
export const sendBirthdayCampaigns: SendBirthdayCampaigns<any, any> = async (args, context) => {
  console.log('🎂 Starting birthday campaign job...');

  try {
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const day = today.getDate();

    // Find all clients with birthday today
    const clients = await context.entities.Client.findMany({
      where: {
        deletedAt: null,
        status: { in: ['ACTIVE', 'VIP'] },
        birthDate: {
          not: null,
        },
        // Check if client has opted in for marketing
        OR: [
          { whatsappMarketingConsent: true },
          { emailMarketingConsent: true },
          { smsMarketingConsent: true },
        ],
      },
      include: {
        salon: true,
      },
    });

    // Filter clients with birthday today
    const birthdayClients = clients.filter((client) => {
      if (!client.birthDate) return false;
      const birthDate = new Date(client.birthDate);
      return birthDate.getMonth() + 1 === month && birthDate.getDate() === day;
    });

    console.log(`Found ${birthdayClients.length} clients with birthday today`);

    if (birthdayClients.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const client of birthdayClients) {
      try {
        // Determine preferred channel
        let channel: 'WHATSAPP' | 'EMAIL' | 'SMS' = 'WHATSAPP';
        if (client.preferredContactMethod === 'EMAIL' && client.email) {
          channel = 'EMAIL';
        } else if (client.preferredContactMethod === 'SMS' && client.phone) {
          channel = 'SMS';
        }

        // Get template variables
        const variables = await communicationService.getClientTemplateVariables(
          client.id,
          client.salonId,
          context
        );

        // Birthday message template
        const messageTemplate = `🎉 Feliz Aniversário, {{clientFirstName}}! 🎂

Toda a equipe da {{salonName}} deseja um dia maravilhoso para você!

Para comemorar, preparamos algo especial: 15% de desconto em qualquer serviço durante todo o mês do seu aniversário! 🎁

Agende já seu horário e aproveite! 💇‍♀️✨

Atenciosamente,
{{salonName}}
📞 {{salonPhone}}`;

        const message = communicationService.replaceTemplateVariables(
          messageTemplate,
          variables
        );

        // Send message
        const result = await communicationService.sendMessage(
          {
            clientId: client.id,
            salonId: client.salonId,
            type: 'BIRTHDAY_GREETING',
            channel,
            subject: '🎉 Feliz Aniversário!',
            message,
            recipientPhone: client.phone || undefined,
            recipientEmail: client.email || undefined,
          },
          context
        );

        if (result.success) {
          sent++;
        } else {
          failed++;
          console.error(`Failed to send birthday message to ${client.name}:`, result.error);
        }

        // Small delay to avoid rate limiting
        await delay(500);
      } catch (error) {
        failed++;
        console.error(`Error sending birthday message to ${client.name}:`, error);
      }
    }

    console.log(`✅ Birthday campaign completed: ${sent} sent, ${failed} failed`);

    return {
      processed: birthdayClients.length,
      sent,
      failed,
    };
  } catch (error) {
    console.error('Birthday campaign job failed:', error);
    throw error;
  }
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
