/**
 * Email templates for salon invites and trial notifications
 * Using the same Glamo branding and structure as auth emails
 */

// Shared email template with Glamo branding (from emails.ts)
const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Glamo</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Glamo
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                Sistema de Gestão para Salões de Beleza
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
                      Este é um e-mail automático. Por favor, não responda.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">
                      © ${new Date().getFullYear()} Glamo. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
                      Precisa de ajuda? Entre em contato: <a href="mailto:suporte@glamo.com.br" style="color: #7C6FF0; text-decoration: none;">suporte@glamo.com.br</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        
        <!-- Spacer for bottom -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Se você não solicitou este e-mail, pode ignorá-lo com segurança.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Email sent to invited user
 */
export function getInviteReceivedEmail(params: {
  salonName: string;
  roleName: string;
  inviterName: string | null;
  acceptLink: string;
  rejectLink: string;
}) {
  const { salonName, roleName, inviterName, acceptLink, rejectLink } = params;

  return {
    subject: `🎉 Você foi convidado para ${salonName} - Glamo`,
    text: `Olá!

Você recebeu um convite para fazer parte da equipe de ${salonName}!

${inviterName ? `${inviterName} convidou você para` : 'Você foi convidado para'} a função de ${roleName}.

Para aceitar o convite, acesse: ${acceptLink}
Para recusar o convite, acesse: ${rejectLink}

Este convite expira em 7 dias.

---
Glamo - Sistema de Gestão para Salões de Beleza
© ${new Date().getFullYear()} Glamo. Todos os direitos reservados.

Precisa de ajuda? suporte@glamo.com.br`,

    html: getEmailTemplate(`
      <!-- Title -->
      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
        🎉 Você foi convidado!
      </h2>

      <!-- Description -->
      <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
        ${inviterName ? `<strong>${inviterName}</strong> convidou você para fazer parte da equipe de` : 'Você foi convidado para fazer parte da equipe de'} 
        <strong style="color: #7C6FF0;">${salonName}</strong>
      </p>

      <!-- Role Badge -->
      <div style="text-align: center; margin: 24px 0;">
        <div style="display: inline-block; padding: 12px 24px; background-color: #f0f9ff; border: 2px solid #7C6FF0; border-radius: 12px;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Função:</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #7C6FF0;">
            ${roleName.charAt(0).toUpperCase() + roleName.slice(1)}
          </p>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${acceptLink}" style="display: inline-block; padding: 16px 32px; margin: 0 8px 16px; background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 111, 240, 0.25);">
          ✓ Aceitar Convite
        </a>
        <br>
        <a href="${rejectLink}" style="display: inline-block; padding: 12px 24px; margin: 0 8px; background: transparent; color: #ef4444; text-decoration: none; border: 2px solid #ef4444; border-radius: 12px; font-weight: 600; font-size: 14px;">
          ✗ Recusar Convite
        </a>
      </div>

      <!-- Expiration Notice -->
      <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
          <strong>⏱️ Importante:</strong> Este convite expira em 7 dias.
        </p>
      </div>
    `),
  };
}

/**
 * Email sent to salon owner when invite is accepted
 */
export function getInviteAcceptedEmail(params: {
  salonName: string;
  userName: string;
  userEmail: string;
  roleName: string;
  dashboardLink: string;
}) {
  const { salonName, userName, userEmail, roleName, dashboardLink } = params;

  return {
    subject: `✅ ${userName} aceitou seu convite - ${salonName}`,
    text: `Ótimas notícias!

${userName} (${userEmail}) aceitou seu convite para fazer parte da equipe de ${salonName} como ${roleName}.

Acesse o dashboard para gerenciar sua equipe: ${dashboardLink}

---
Glamo - Sistema de Gestão para Salões de Beleza
© ${new Date().getFullYear()} Glamo. Todos os direitos reservados.

Precisa de ajuda? suporte@glamo.com.br`,

    html: getEmailTemplate(`
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 48px; color: #ffffff;">✓</span>
        </div>
      </div>

      <!-- Title -->
      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
        Convite Aceito!
      </h2>

      <!-- Description -->
      <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
        <strong>${userName}</strong> aceitou seu convite para fazer parte da equipe de <strong style="color: #7C6FF0;">${salonName}</strong>
      </p>

      <!-- User Info Box -->
      <div style="margin: 32px 0; padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 14px; color: #6b7280;">Nome:</span>
              <span style="font-size: 14px; font-weight: 600; color: #111827; margin-left: 8px;">${userName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 14px; color: #6b7280;">Email:</span>
              <span style="font-size: 14px; font-weight: 600; color: #111827; margin-left: 8px;">${userEmail}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 14px; color: #6b7280;">Função:</span>
              <span style="font-size: 14px; font-weight: 600; color: #7C6FF0; margin-left: 8px;">${roleName.charAt(0).toUpperCase() + roleName.slice(1)}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 111, 240, 0.25);">
          Ver Equipe no Dashboard
        </a>
      </div>
    `),
  };
}

/**
 * Email sent to salon owner when invite is rejected
 */
export function getInviteRejectedEmail(params: {
  salonName: string;
  userEmail: string;
  roleName: string;
  dashboardLink: string;
}) {
  const { salonName, userEmail, roleName, dashboardLink } = params;

  return {
    subject: `❌ Convite recusado - ${salonName}`,
    text: `Informação sobre convite

O usuário ${userEmail} recusou o convite para fazer parte da equipe de ${salonName} como ${roleName}.

Você pode enviar um novo convite quando quiser através do dashboard: ${dashboardLink}

---
Glamo - Sistema de Gestão para Salões de Beleza
© ${new Date().getFullYear()} Glamo. Todos os direitos reservados.

Precisa de ajuda? suporte@glamo.com.br`,

    html: getEmailTemplate(`
      <!-- Title -->
      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
        Convite Recusado
      </h2>

      <!-- Description -->
      <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
        O usuário <strong>${userEmail}</strong> recusou o convite para fazer parte da equipe de <strong style="color: #7C6FF0;">${salonName}</strong> como ${roleName}.
      </p>

      <!-- Info Box -->
      <div style="margin: 32px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
          <strong>💡 Dica:</strong> Você pode enviar um novo convite a qualquer momento através do seu dashboard.
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 111, 240, 0.25);">
          Ir para Dashboard
        </a>
      </div>
    `),
  };
}

/**
 * Email sent 3 days before trial expires
 */
export function getTrialExpiringEmail(params: {
  userName: string;
  daysRemaining: number;
  pricingLink: string;
}) {
  const { userName, daysRemaining, pricingLink } = params;

  return {
    subject: `⏰ Seu trial expira em ${daysRemaining} dias - Glamo`,
    text: `Olá ${userName}!

Seu período de trial do Glamo expira em ${daysRemaining} dias.

Para continuar aproveitando todos os benefícios do plano Profissional, escolha um plano que atenda suas necessidades:

${pricingLink}

Com um plano pago você tem:
✓ Acesso ilimitado a todas as funcionalidades
✓ Suporte prioritário
✓ Relatórios personalizados
✓ E muito mais!

Não perca seus dados e configurações. Assine agora!

---
Glamo - Sistema de Gestão para Salões de Beleza
© ${new Date().getFullYear()} Glamo. Todos os direitos reservados.

Precisa de ajuda? suporte@glamo.com.br`,

    html: getEmailTemplate(`
      <!-- Alert Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 48px; color: #ffffff;">⏰</span>
        </div>
      </div>

      <!-- Title -->
      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
        Seu trial está acabando
      </h2>

      <!-- Description -->
      <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
        Olá <strong>${userName}</strong>! Seu período de trial do <strong style="color: #7C6FF0;">Glamo</strong> expira em <strong style="color: #f59e0b;">${daysRemaining} dias</strong>.
      </p>

      <!-- Benefits List -->
      <div style="margin: 32px 0; padding: 24px; background-color: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
        <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0c4a6e; text-align: center;">
          Continue aproveitando todos os benefícios:
        </p>
        <ul style="margin: 0; padding-left: 24px; font-size: 14px; color: #0c4a6e; line-height: 2;">
          <li>✓ Agendamentos ilimitados</li>
          <li>✓ Até 5 profissionais</li>
          <li>✓ 2 salões</li>
          <li>✓ Suporte prioritário</li>
          <li>✓ Relatórios personalizados</li>
          <li>✓ 50GB de armazenamento</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${pricingLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 111, 240, 0.25);">
          Ver Planos e Assinar
        </a>
      </div>

      <!-- Urgency Notice -->
      <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
          <strong>⚠️ Importante:</strong> Seus dados não serão perdidos, mas o acesso será limitado até que você escolha um plano.
        </p>
      </div>
    `),
  };
}

/**
 * Email sent when trial expires
 */
export function getTrialExpiredEmail(params: {
  userName: string;
  pricingLink: string;
}) {
  const { userName, pricingLink } = params;

  return {
    subject: `⏰ Seu trial expirou - Escolha um plano - Glamo`,
    text: `Olá ${userName}!

Seu período de trial do Glamo expirou.

Para continuar usando o sistema, escolha um plano:

${pricingLink}

Seus dados estão seguros e serão restaurados assim que você assinar um plano.

Planos disponíveis:
• Essencial: R$ 19,90/mês
• Profissional: R$ 49,90/mês (RECOMENDADO)
• Enterprise: Sob consulta

---
Glamo - Sistema de Gestão para Salões de Beleza
© ${new Date().getFullYear()} Glamo. Todos os direitos reservados.

Precisa de ajuda? suporte@glamo.com.br`,

    html: getEmailTemplate(`
      <!-- Alert Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 48px; color: #ffffff;">⏰</span>
        </div>
      </div>

      <!-- Title -->
      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
        Seu trial expirou
      </h2>

      <!-- Description -->
      <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
        Olá <strong>${userName}</strong>! Seu período de trial do <strong style="color: #7C6FF0;">Glamo</strong> expirou.
      </p>

      <!-- Alert Box -->
      <div style="margin: 32px 0; padding: 20px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.6;">
          <strong>🔒 Acesso Limitado:</strong> Para continuar usando o sistema, escolha um dos nossos planos.
        </p>
      </div>

      <!-- Reassurance -->
      <div style="margin: 24px 0; padding: 20px; background-color: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
        <p style="margin: 0; font-size: 14px; color: #0c4a6e; line-height: 1.6; text-align: center;">
          <strong>✓ Seus dados estão seguros</strong><br>
          Todas as suas informações serão restauradas assim que você assinar um plano.
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${pricingLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 111, 240, 0.25);">
          Escolher Plano Agora
        </a>
      </div>

      <!-- Plans Preview -->
      <div style="margin-top: 32px; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
        <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827; text-align: center;">
          Planos Disponíveis:
        </p>
        <table role="presentation" width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="font-size: 14px; color: #6b7280;">Essencial</td>
            <td style="font-size: 14px; font-weight: 600; color: #111827; text-align: right;">R$ 19,90/mês</td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #7C6FF0; font-weight: 600;">
              Profissional ⭐ RECOMENDADO
            </td>
            <td style="font-size: 14px; font-weight: 600; color: #7C6FF0; text-align: right;">R$ 49,90/mês</td>
          </tr>
          <tr>
            <td style="font-size: 14px; color: #6b7280;">Enterprise</td>
            <td style="font-size: 14px; font-weight: 600; color: #111827; text-align: right;">Sob consulta</td>
          </tr>
        </table>
      </div>
    `),
  };
}
