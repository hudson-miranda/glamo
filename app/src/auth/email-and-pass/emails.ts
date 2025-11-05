import { type GetVerificationEmailContentFn, type GetPasswordResetEmailContentFn } from 'wasp/server/auth';

// Shared email template with Glamo branding
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

export const getVerificationEmailContent: GetVerificationEmailContentFn = ({ verificationLink }) => ({
  subject: '✨ Confirme seu e-mail - Glamo',
  text: `Olá!

Obrigado por se cadastrar no Glamo!

Para completar seu cadastro e começar a usar nosso sistema de gestão para salões de beleza, por favor confirme seu e-mail clicando no link abaixo:

${verificationLink}

Este link é válido por 24 horas.

Se você não criou uma conta no Glamo, pode ignorar este e-mail com segurança.

---
Glamo - Sistema de Gestão para Salões de Beleza
© ${new Date().getFullYear()} Glamo. Todos os direitos reservados.

Precisa de ajuda? suporte@glamo.com.br`,
  
  html: getEmailTemplate(`
    
    <!-- Title -->
    <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
      Confirme seu e-mail
    </h2>

    <!-- Description -->
    <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
      Obrigado por se cadastrar no <strong style="color: #7C6FF0;">Glamo</strong>! Para completar seu cadastro e começar a usar nosso sistema, clique no botão abaixo:
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 111, 240, 0.25);">
        Confirmar E-mail
      </a>
    </div>

    <!-- Alternative Link -->
    <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6;">
      Ou copie e cole este link no seu navegador:
    </p>
    <p style="margin: 8px 0 0; font-size: 13px; color: #7C6FF0; text-align: center; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
      ${verificationLink}
    </p>

    <!-- Expiration Notice -->
    <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
        <strong>⏱️ Importante:</strong> Este link expira em 24 horas por motivos de segurança.
      </p>
    </div>
  `),
});

export const getPasswordResetEmailContent: GetPasswordResetEmailContentFn = ({ passwordResetLink }) => ({
  subject: '🔐 Redefinição de senha - Glamo',
  text: `Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no Glamo.

Para criar uma nova senha, clique no link abaixo:

${passwordResetLink}

Este link é válido por 1 hora.

Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança. Sua senha permanecerá inalterada.

Por segurança, recomendamos que você:
- Use uma senha forte com letras maiúsculas, minúsculas e números
- Não compartilhe sua senha com ninguém
- Altere sua senha regularmente

---
Glamo - Sistema de Gestão para Salões de Beleza
© ${new Date().getFullYear()} Glamo. Todos os direitos reservados.

Precisa de ajuda? suporte@glamo.com.br`,
  
  html: getEmailTemplate(`

    <!-- Title -->
    <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #111827; text-align: center; line-height: 1.3;">
      Redefinir senha
    </h2>

    <!-- Description -->
    <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; text-align: center; line-height: 1.6;">
      Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color: #7C6FF0;">Glamo</strong>. Clique no botão abaixo para criar uma nova senha:
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${passwordResetLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ADA5FB 0%, #6B5CF6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(124, 111, 240, 0.25);">
        Redefinir Senha
      </a>
    </div>

    <!-- Alternative Link -->
    <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6;">
      Ou copie e cole este link no seu navegador:
    </p>
    <p style="margin: 8px 0 0; font-size: 13px; color: #7C6FF0; text-align: center; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
      ${passwordResetLink}
    </p>

    <!-- Security Notice -->
    <div style="margin-top: 32px; padding: 16px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px;">
      <p style="margin: 0 0 12px; font-size: 14px; color: #991b1b; line-height: 1.6;">
        <strong>🔒 Segurança:</strong> Este link expira em 1 hora.
      </p>
      <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.6;">
        Se você não solicitou esta alteração, alguém pode estar tentando acessar sua conta. Entre em contato conosco imediatamente.
      </p>
    </div>

    <!-- Security Tips -->
    <div style="margin-top: 24px; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
      <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #0c4a6e;">
        💡 Dicas de segurança:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #0c4a6e; line-height: 1.8;">
        <li>Use uma senha forte com letras maiúsculas, minúsculas e números</li>
        <li>Não compartilhe sua senha com ninguém</li>
        <li>Altere sua senha regularmente</li>
        <li>Ative a autenticação de dois fatores quando disponível</li>
      </ul>
    </div>
  `),
});
