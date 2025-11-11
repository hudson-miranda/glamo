
import type { SendAppointmentReminders } from 'wasp/server/jobs';
import { communicationService } from '../services/communicationService';

/**
 * Appointment Reminders Job
 * 
 * Sends reminders for upcoming appointments:
 * - 24 hours before
 * - 2 hours before
 * 
 * Runs every hour.
 */
export const sendAppointmentReminders: SendAppointmentReminders<any, any> = async (
  args,
  context
) => {
  console.log('⏰ Starting appointment reminders job...');

  try {
    const now = new Date();
    
    // Get appointments for the next 25 hours (to catch 24h reminders)
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    // Get appointments for the next 3 hours (to catch 2h reminders)
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const appointments = await context.entities.Appointment.findMany({
      where: {
        deletedAt: null,
        status: 'CONFIRMED',
        startAt: {
          gte: now,
          lte: twentyFiveHoursFromNow,
        },
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
    }) as any[];

    console.log(`Found ${appointments.length} upcoming appointments`);

    let sent24h = 0;
    let sent2h = 0;
    let failed = 0;

    for (const appointment of appointments) {
      if (!appointment.client) continue;

      try {
        const timeUntilAppointment = appointment.startAt.getTime() - now.getTime();
        const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

        let shouldSend = false;
        let reminderType: '24h' | '2h' | null = null;

        // Check if we should send 24h reminder
        if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 23) {
          // Check if we already sent 24h reminder
          const existing24h = await context.entities.CommunicationLog.findFirst({
            where: {
              clientId: appointment.clientId,
              type: 'APPOINTMENT_REMINDER',
              metadata: {
                path: ['appointmentId'],
                equals: appointment.id,
              },
              createdAt: {
                gte: new Date(now.getTime() - 25 * 60 * 60 * 1000),
              },
            },
          });

          if (!existing24h) {
            shouldSend = true;
            reminderType = '24h';
          }
        }

        // Check if we should send 2h reminder
        if (hoursUntilAppointment <= 2 && hoursUntilAppointment > 1.5) {
          // Check if we already sent 2h reminder
          const existing2h = await context.entities.CommunicationLog.findFirst({
            where: {
              clientId: appointment.clientId,
              type: 'APPOINTMENT_REMINDER',
              metadata: {
                path: ['appointmentId'],
                equals: appointment.id,
              },
              createdAt: {
                gte: new Date(now.getTime() - 3 * 60 * 60 * 1000),
              },
            },
          });

          if (!existing2h) {
            shouldSend = true;
            reminderType = '2h';
          }
        }

        if (!shouldSend || !reminderType) continue;

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

        // Format appointment date and time
        const appointmentDate = appointment.startAt.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        const appointmentTime = appointment.startAt.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // Get service names
        const serviceNames = appointment.services.map((s: any) => s.service.name).join(', ');

        // Reminder message template
        const reminderPrefix = reminderType === '24h' ? '⏰ Lembrete: ' : '⏰ Seu agendamento é daqui a 2 horas!';
        
        const messageTemplate = `${reminderPrefix}

Olá, {{clientFirstName}}!

Este é um lembrete do seu agendamento:

📅 Data: ${appointmentDate}
🕐 Horário: ${appointmentTime}
💇 Serviços: ${serviceNames}
👤 Profissional: ${appointment.professional?.name || 'A confirmar'}

📍 Local: {{salonName}}
${variables.salonAddress ? `   ${variables.salonAddress}` : ''}

Em caso de imprevistos, entre em contato o quanto antes:
📞 {{salonPhone}}

Aguardamos você! ✨

Equipe {{salonName}}`;

        const message = communicationService.replaceTemplateVariables(
          messageTemplate,
          variables
        );

        // Send reminder
        const result = await communicationService.sendMessage(
          {
            clientId: appointment.client.id,
            salonId: appointment.salonId,
            type: 'APPOINTMENT_REMINDER',
            channel,
            subject: `⏰ Lembrete: Agendamento ${reminderType === '24h' ? 'amanhã' : 'em 2 horas'}`,
            message,
            recipientPhone: appointment.client.phone || undefined,
            recipientEmail: appointment.client.email || undefined,
            metadata: {
              appointmentId: appointment.id,
              reminderType,
            },
          },
          context
        );

        if (result.success) {
          if (reminderType === '24h') {
            sent24h++;
          } else {
            sent2h++;
          }
        } else {
          failed++;
          console.error(`Failed to send reminder to ${appointment.client.name}:`, result.error);
        }

        // Small delay to avoid rate limiting
        await delay(300);
      } catch (error) {
        failed++;
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
      }
    }

    console.log(`✅ Appointment reminders completed: ${sent24h} sent (24h), ${sent2h} sent (2h), ${failed} failed`);

    return {
      processed: appointments.length,
      sent24h,
      sent2h,
      failed,
    };
  } catch (error) {
    console.error('Appointment reminders job failed:', error);
    throw error;
  }
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
