/**
 * MHC WhatsApp Communication Gateway Client
 * Implements integration with the official MyHealthChapter WhatsApp Gateway v2.0
 */

export interface MHCWhatsAppConfig {
  baseURL?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface MHCSendMessageResponse {
  success: boolean;
  messageId?: string;
  timestamp?: number;
  sourceApp?: string;
  error?: string;
  simulated?: boolean;
}

export class MHCWhatsAppGatewayService {
  private baseURL: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor(config: MHCWhatsAppConfig = {}) {
    this.baseURL = (
      config.baseURL ||
      process.env.MHC_WHATSAPP_BASE_URL ||
      'https://dev-wa.nextgenmultiverse.com'
    ).replace(/\/+$/, '');

    this.apiKey = config.apiKey || process.env.MHC_WHATSAPP_API_KEY || 'mhc_sec_saypulse_62u8zcjo7o5e2bye';
    this.timeoutMs = config.timeoutMs || 10000;
  }

  /**
   * Format phone number to clean WhatsApp international digits (e.g. 919013793020)
   */
  public formatPhoneNumber(rawPhone: string): string {
    const cleaned = rawPhone.replace(/[^0-9]/g, '');

    // 10-digit Indian number (e.g. 9013793020) -> prepend 91
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }

    // 11-digit starting with 0 (e.g. 09013793020) -> replace 0 with 91
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `91${cleaned.slice(1)}`;
    }

    // 12-digit already with 91 (e.g. 919013793020)
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned;
    }

    return cleaned;
  }

  /**
   * Send WhatsApp text message via MHC Gateway
   */
  async sendMessage(toPhone: string, text: string): Promise<MHCSendMessageResponse> {
    const formattedTo = this.formatPhoneNumber(toPhone);
    const endpoint = `${this.baseURL}/api/v1/send-message`;

    const payload = {
      to: formattedTo,
      type: 'text',
      text,
    };

    console.log(`\n📱 [MHC WhatsApp Gateway] Dispatching message:`);
    console.log(`   ▸ Gateway URL: ${endpoint}`);
    console.log(`   ▸ Recipient:   ${formattedTo}`);
    console.log(`   ▸ Text:        ${text.replace(/\n/g, ' ')}`);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn(`[MHC Gateway Response ${response.status}]:`, data);
        return {
          success: false,
          error: data.error || `Gateway returned HTTP ${response.status}`,
        };
      }

      console.log(`   ▸ Result:      ✅ Success (MessageId: ${data.messageId || 'ok'})\n`);

      return {
        success: true,
        messageId: data.messageId,
        timestamp: data.timestamp,
        sourceApp: data.sourceApp,
      };
    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      console.warn(`[MHC WhatsApp Gateway Warning] ${isAbort ? 'Timeout' : err.message}`);

      return {
        success: false,
        error: isAbort ? 'Gateway request timed out' : err.message,
      };
    }
  }

  /**
   * Send Login Verification OTP via MHC Gateway
   */
  async sendLoginOtp(phone: string, otp: string): Promise<MHCSendMessageResponse> {
    const otpMessage = `🔐 *SayPulse Login Verification*\n\nYour One-Time Password (OTP) is: *${otp}*\n\n⏰ _Valid for 10 minutes. Do not share this code with anyone for security._`;
    return this.sendMessage(phone, otpMessage);
  }
}

export const mhcWhatsAppClient = new MHCWhatsAppGatewayService();
