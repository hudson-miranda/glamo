
import type { CommunicationChannel, CommunicationStatus } from '@prisma/client';

/**
 * WhatsApp Service - Twilio WhatsApp API Integration
 * 
 * This service handles sending WhatsApp messages through Twilio's API.
 * 
 * Setup Requirements:
 * 1. Create Twilio account at https://www.twilio.com/
 * 2. Enable WhatsApp in Twilio Console
 * 3. Add environment variables:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_WHATSAPP_FROM (format: whatsapp:+14155238886)
 */

interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., "+5511999999999")
  message: string;
  mediaUrl?: string; // Optional media attachment
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  status: CommunicationStatus;
  error?: string;
  cost?: number;
}

class WhatsAppService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private isConfigured: boolean;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || '';
    this.isConfigured = !!(this.accountSid && this.authToken && this.fromNumber);

    if (!this.isConfigured) {
      console.warn(
        '⚠️  WhatsApp service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM environment variables.'
      );
    }
  }

  /**
   * Send a WhatsApp message
   */
  async sendMessage(params: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        status: 'FAILED',
        error: 'WhatsApp service not configured',
      };
    }

    try {
      // Validate phone number format
      const formattedPhone = this.formatPhoneNumber(params.to);
      if (!formattedPhone) {
        return {
          success: false,
          status: 'FAILED',
          error: 'Invalid phone number format',
        };
      }

      // For development/testing, simulate success without actual API call
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_WHATSAPP === 'true') {
        console.log('📱 [MOCK] WhatsApp message:', {
          to: formattedPhone,
          message: params.message,
        });
        
        return {
          success: true,
          messageId: `mock_${Date.now()}`,
          status: 'SENT',
          cost: 0.01,
        };
      }

      // Actual Twilio API call
      const response = await this.twilioApiCall({
        to: `whatsapp:${formattedPhone}`,
        from: this.fromNumber,
        body: params.message,
        mediaUrl: params.mediaUrl ? [params.mediaUrl] : undefined,
      });

      return {
        success: true,
        messageId: response.sid,
        status: this.mapTwilioStatus(response.status),
        cost: parseFloat(response.price || '0'),
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk WhatsApp messages with rate limiting
   */
  async sendBulkMessages(
    messages: WhatsAppMessage[],
    delayMs: number = 1000
  ): Promise<WhatsAppResponse[]> {
    const results: WhatsAppResponse[] = [];

    for (const message of messages) {
      const result = await this.sendMessage(message);
      results.push(result);

      // Rate limiting delay
      if (messages.indexOf(message) < messages.length - 1) {
        await this.delay(delayMs);
      }
    }

    return results;
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Validate Brazilian phone number (11 digits with country code)
    if (cleaned.length === 11 && cleaned.startsWith('55')) {
      return `+${cleaned}`;
    }

    // Add Brazilian country code if missing
    if (cleaned.length === 11 && !cleaned.startsWith('55')) {
      return `+55${cleaned}`;
    }

    // Remove Brazilian country code prefix if it's there
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned}`;
    }

    // For other formats, try to add +
    if (cleaned.length >= 10) {
      return `+${cleaned}`;
    }

    return null;
  }

  /**
   * Map Twilio status to our CommunicationStatus enum
   */
  private mapTwilioStatus(twilioStatus: string): CommunicationStatus {
    switch (twilioStatus) {
      case 'queued':
        return 'QUEUED';
      case 'sent':
      case 'sending':
        return 'SENT';
      case 'delivered':
        return 'DELIVERED';
      case 'read':
        return 'READ';
      case 'failed':
      case 'undelivered':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  }

  /**
   * Call Twilio API
   */
  private async twilioApiCall(params: {
    to: string;
    from: string;
    body: string;
    mediaUrl?: string[];
  }): Promise<any> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    const formData = new URLSearchParams({
      To: params.to,
      From: params.from,
      Body: params.body,
    });

    if (params.mediaUrl) {
      params.mediaUrl.forEach((url) => formData.append('MediaUrl', url));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Twilio API error');
    }

    return await response.json();
  }

  /**
   * Utility: delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate WhatsApp template message
   * Note: Twilio requires approved templates for business accounts
   */
  validateTemplate(template: string, variables: Record<string, string>): string {
    let message = template;

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return message;
  }

  /**
   * Check if service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Export types
export type { WhatsAppMessage, WhatsAppResponse };
