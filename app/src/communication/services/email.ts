
import type { CommunicationStatus } from '@prisma/client';

/**
 * Email Service - SendGrid Integration
 * 
 * This service handles sending emails through SendGrid's API.
 * 
 * Setup Requirements:
 * 1. Create SendGrid account at https://sendgrid.com/
 * 2. Create API key with Mail Send permissions
 * 3. Verify sender email/domain
 * 4. Add environment variables:
 *    - SENDGRID_API_KEY
 *    - SENDGRID_FROM_EMAIL
 *    - SENDGRID_FROM_NAME
 */

interface EmailMessage {
  to: string; // Email address
  subject: string;
  message: string; // Plain text or HTML
  isHtml?: boolean;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

interface EmailAttachment {
  content: string; // Base64 encoded
  filename: string;
  type: string; // MIME type
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  status: CommunicationStatus;
  error?: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@glamo.com.br';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Glamo';
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      console.warn(
        '⚠️  Email service not configured. Please set SENDGRID_API_KEY environment variable.'
      );
    }
  }

  /**
   * Send an email
   */
  async sendEmail(params: EmailMessage): Promise<EmailResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Email service not configured',
      };
    }

    try {
      // Validate email
      if (!this.isValidEmail(params.to)) {
        return {
          success: false,
          status: 'FAILED',
          error: 'Invalid email address',
        };
      }

      // For development/testing, simulate success without actual API call
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_EMAIL === 'true') {
        console.log('📧 [MOCK] Email:', {
          to: params.to,
          subject: params.subject,
          message: params.message.substring(0, 100) + '...',
        });
        
        return {
          success: true,
          messageId: `mock_${Date.now()}`,
          status: 'SENT',
        };
      }

      // Actual SendGrid API call
      const response = await this.sendGridApiCall({
        personalizations: [
          {
            to: [{ email: params.to }],
          },
        ],
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        reply_to: params.replyTo
          ? {
              email: params.replyTo,
            }
          : undefined,
        subject: params.subject,
        content: [
          {
            type: params.isHtml ? 'text/html' : 'text/plain',
            value: params.message,
          },
        ],
        attachments: params.attachments,
      });

      return {
        success: true,
        messageId: response.headers?.['x-message-id'] || `sent_${Date.now()}`,
        status: 'SENT',
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];

    // SendGrid allows bulk sending, but for simplicity we'll send one by one
    // In production, consider using SendGrid's batch sending feature
    for (const message of messages) {
      const result = await this.sendEmail(message);
      results.push(result);
    }

    return results;
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail(params: {
    to: string;
    templateId: string;
    dynamicData: Record<string, any>;
  }): Promise<EmailResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Email service not configured',
      };
    }

    try {
      const response = await this.sendGridApiCall({
        personalizations: [
          {
            to: [{ email: params.to }],
            dynamic_template_data: params.dynamicData,
          },
        ],
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        template_id: params.templateId,
      });

      return {
        success: true,
        messageId: response.headers?.['x-message-id'] || `sent_${Date.now()}`,
        status: 'SENT',
      };
    } catch (error) {
      console.error('Template email send error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Call SendGrid API
   */
  private async sendGridApiCall(body: any): Promise<any> {
    const url = 'https://api.sendgrid.com/v3/mail/send';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.message || 'SendGrid API error');
    }

    return {
      headers: Object.fromEntries(response.headers.entries()),
    };
  }

  /**
   * Check if service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { EmailMessage, EmailResponse, EmailAttachment };
