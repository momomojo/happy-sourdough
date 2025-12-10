import { Resend } from 'resend';

// Initialize Resend client lazily to avoid build-time errors when env vars are not set
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in environment variables');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export const resend = {
  get emails() {
    return getResendClient().emails;
  },
};

// Happy Sourdough email configuration
export const EMAIL_CONFIG = {
  from: 'Happy Sourdough <orders@happysourdough.com>',
  replyTo: 'support@happysourdough.com',
} as const;
