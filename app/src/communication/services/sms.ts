
import type { CommunicationStatus } from '@prisma/client';

/**
 * SMS Service - Twilio SMS API Integration
 * 
 * This service handles sending SMS messages through Twilio's API.
 * 
 * Setup Requirements:
 * 1. Use same Twilio account as WhatsApp
 * 2. Get a Twilio phone number
 * 3. Add environment variables:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_SMS_FROM (format: +14155238886)
 */

interface SMSMessage {
  to: string; // Phone number with country code
  message: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  status: CommunicationStatus;
  error?: string;
  cost?: number;
}

class SMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private isConfigured: boolean;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_SMS_FROM || '';
    this.isConfigured = !!(this.accountSid && this.authToken && this.fromNumber);

    if (!this.isConfigured) {
      console.warn(
        '⚠️  SMS service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_SMS_FROM environment variables.'
      );
    }
  }

  /**
   * Send an SMS message
   */
  async sendSMS(params: SMSMessage): Promise<SMSResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        status: 'FAILED',
        error: 'SMS service not configured',
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
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_SMS === 'true') {
        console.log('📱 [MOCK] SMS:', {
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
        to: formattedPhone,
        from: this.fromNumber,
        body: params.message,
      });

      return {
        success: true,
        messageId: response.sid,
        status: this.mapTwilioStatus(response.status),
        cost: parseFloat(response.price || '0'),
      };
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk SMS messages with rate limiting
   */
  async sendBulkSMS(messages: SMSMessage[], delayMs: number = 1000): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];

    for (const message of messages) {
      const result = await this.sendSMS(message);
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

    // Validate Brazilian phone number
    if (cleaned.length === 11 && cleaned.startsWith('55')) {
      return `+${cleaned}`;
    }

    if (cleaned.length === 11 && !cleaned.startsWith('55')) {
      return `+55${cleaned}`;
    }

    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned}`;
    }

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
  }): Promise<any> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    const formData = new URLSearchParams({
      To: params.to,
      From: params.from,
      Body: params.body,
    });

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
   * Check if service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const smsService = new SMSService();

// Export types
export type { SMSMessage, SMSResponse };
