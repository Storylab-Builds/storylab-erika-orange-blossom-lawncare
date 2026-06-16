// Resolves live integration credentials. Order of precedence:
//   1. The `integrations` Setting row in the DB (editable in Settings -> Integrations)
//   2. Environment variables (.env)
// This lets an admin reconfigure Twilio/Resend keys at runtime without a redeploy,
// while keeping a sensible default for local development.

import { prisma } from '../db';
import { env } from '../env';

export interface IntegrationsConfig {
  twilio: { accountSid: string; authToken: string; fromNumber: string; enabled: boolean };
  resend: { apiKey: string; from: string; quoteInbox: string; enabled: boolean };
  notifications: { smsEnabled: boolean; emailEnabled: boolean };
}

type StoredIntegrations = {
  twilio?: { accountSid?: string; authToken?: string; fromNumber?: string; enabled?: boolean };
  resend?: { apiKey?: string; from?: string; quoteInbox?: string; enabled?: boolean };
  notifications?: { smsEnabled?: boolean; emailEnabled?: boolean };
};

function firstNonEmpty(...vals: (string | undefined)[]): string {
  for (const v of vals) if (v && v.trim() !== '') return v.trim();
  return '';
}

/** Read the merged integration config (DB Setting overrides env). */
export async function getIntegrationsConfig(): Promise<IntegrationsConfig> {
  const row = await prisma.setting.findUnique({ where: { key: 'integrations' } });
  const stored = (row?.value as StoredIntegrations) ?? {};

  const twilio = {
    accountSid: firstNonEmpty(stored.twilio?.accountSid, env.twilio.accountSid),
    authToken: firstNonEmpty(stored.twilio?.authToken, env.twilio.authToken),
    fromNumber: firstNonEmpty(stored.twilio?.fromNumber, env.twilio.fromNumber),
    enabled: stored.twilio?.enabled !== false, // default on when creds present
  };
  const resend = {
    apiKey: firstNonEmpty(stored.resend?.apiKey, env.resend.apiKey),
    from: firstNonEmpty(stored.resend?.from, env.resend.from),
    quoteInbox: firstNonEmpty(stored.resend?.quoteInbox, env.resend.quoteInbox),
    enabled: stored.resend?.enabled !== false,
  };

  return {
    twilio: { ...twilio, enabled: twilio.enabled && !!twilio.accountSid && !!twilio.authToken },
    resend: { ...resend, enabled: resend.enabled },
    notifications: {
      smsEnabled: stored.notifications?.smsEnabled !== false,
      emailEnabled: stored.notifications?.emailEnabled !== false,
    },
  };
}

/** Masked view of integration config for the Settings UI — never leaks full secrets. */
export function maskSecret(value: string): string {
  if (!value) return '';
  if (value.length <= 6) return '••••';
  return `${value.slice(0, 4)}••••${value.slice(-2)}`;
}
