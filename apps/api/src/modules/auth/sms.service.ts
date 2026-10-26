import { Injectable, Logger } from "@nestjs/common";

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * Dispatches an SMS containing an OTP verification code.
   * In Development: Logs a formatted high-visibility verification box to the terminal console.
   * In Production (with Twilio or other gateway configured): Dispatches directly via SMS provider API.
   */
  async sendOtpSms(phoneNumber: string, otp: string): Promise<SendSmsResult> {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Check if live SMS provider credentials are provided
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");

        const body = new URLSearchParams({
          To: phoneNumber.replace(/\s+/g, ""),
          From: twilioPhoneNumber,
          Body: `Your EverPride verification code is ${otp}. Valid for 5 minutes. Do not share this code.`,
        });

        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const twilioMessage = errData?.message || "Failed to dispatch SMS through gateway.";
          this.logger.error(`Twilio SMS dispatch failed [${res.status}]: ${JSON.stringify(errData)}`);
          return { success: false, error: twilioMessage };
        }

        const data: any = await res.json();
        this.logger.log(`Live SMS dispatched successfully to ${phoneNumber} (SID: ${data.sid})`);
        return { success: true, messageId: data.sid };
      } catch (err: any) {
        this.logger.error(`SMS provider network error: ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    // Development fallback: Log the OTP securely and visibly to the server terminal
    this.logger.log(`
┌──────────────────────────────────────────────────────────┐
│  EVERPRIDE SECURE PHONE AUTH (DEV / LOCAL SMS SIMULATOR) │
├──────────────────────────────────────────────────────────┤
│  Recipient Phone : ${phoneNumber.padEnd(38)}│
│  One-Time Pass   : ${otp.padEnd(38)}│
│  Validity        : 5 Minutes                             │
└──────────────────────────────────────────────────────────┘
`);

    return {
      success: true,
      messageId: `dev-sim-${Date.now()}`,
    };
  }
}
