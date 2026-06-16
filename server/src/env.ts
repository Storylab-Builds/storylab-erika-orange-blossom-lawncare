import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5174',

  // Integration defaults. These are FALLBACKS — the live values are read at call
  // time from the `integrations` Setting (DB) first, then these env vars. That
  // ordering lets an admin reconfigure keys in Settings without a redeploy.
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_SMS_NUMBER || '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'Orange Blossom Lawncare <onboarding@resend.dev>',
    quoteInbox: process.env.QUOTE_INBOX || 'hello@orangeblossom.com',
  },
};
