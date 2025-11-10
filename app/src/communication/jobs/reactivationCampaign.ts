
import type { SendReactivationCampaigns } from 'wasp/server/jobs';
import { communicationService } from '../services/communicationService';

/**
 * Reactivation Campaign Job
 * 
 * Sends reactivation messages to clients who haven't visited in 60+ days.
 * Runs weekly on Mondays at 10 AM.
 */
export const sendReactivationCampaigns: SendReactivationCampaigns<any, any> = async (
  args,
  context
) => {
  console.log('🔄 Starting reactivation campaign job...');

  try {
    const today = new Date();
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Find inactive clients (last visit 60-90 days ago)
    const clients = await context.entities.Client.findMany({
      where: {
        deletedAt: null,
        status: { in: ['ACTIVE', 'INACTIVE'] },
        lastVisitDate: {
          gte: ninetyDaysAgo,
          lte: sixtyDaysAgo,
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

    console.log(`Found ${clients.length} clients for reactivation`);

    if (clients.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const client of clients) {
      try {
        // Check if we already sent a reactivation message recently (last 30 days)
        const recentReactivation = await context.entities.CommunicationLog.findFirst({
          where: {
            clientId: client.id,
            type: 'REACTIVATION_CAMPAIGN',
            createdAt: {
              gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        });

        if (recentReactivation) {
          console.log(`Skipping ${client.name} - already sent reactivation recently`);
          continue;
        }

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

        // Calculate days since last visit
        const daysSinceLastVisit = client.lastVisitDate
          ? Math.floor((today.getTime() - new Date(client.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        // Reactivation message template
        const messageTemplate = `Olá, {{clientFirstName}}! 💙

Sentimos sua falta! 😊

Notamos que você não nos visita há ${daysSinceLastVisit} dias e gostaríamos muito de ter você de volta!

Para celebrar seu retorno, preparamos uma oferta especial: **20% de desconto** no seu próximo agendamento! 🎁✨

Venha nos fazer uma visita e deixe-se mimar pela nossa equipe!

Agende já pelo WhatsApp ou telefone:
📞 {{salonPhone}}

Com carinho,
Equipe {{salonName}} 💇‍♀️`;

        const message = communicationService.replaceTemplateVariables(
          messageTemplate,
          variables
        );

        // Send message
        const result = await communicationService.sendMessage(
          {
            clientId: client.id,
            salonId: client.salonId,
            type: 'REACTIVATION_CAMPAIGN',
            channel,
            subject: 'Sentimos sua falta! Volte e ganhe desconto 💙',
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
          console.error(`Failed to send reactivation message to ${client.name}:`, result.error);
        }

        // Small delay to avoid rate limiting
        await delay(500);
      } catch (error) {
        failed++;
        console.error(`Error sending reactivation message to ${client.name}:`, error);
      }
    }

    console.log(`✅ Reactivation campaign completed: ${sent} sent, ${failed} failed`);

    return {
      processed: clients.length,
      sent,
      failed,
    };
  } catch (error) {
    console.error('Reactivation campaign job failed:', error);
    throw error;
  }
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
