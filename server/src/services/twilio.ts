// Twilio SMS service. Sends a real SMS when credentials are configured (DB Setting
// or env), logs every attempt to the MessageLog table, and degrades gracefully to a
// "dev-log" transport when unconfigured so the rest of the app keeps working.
//
// Pattern mirrors the VADIS production integration (twilio npm client + audit log).

import twilio from 'twilio';
import { prisma } from '../db';
import { env } from '../env';
import { getIntegrationsConfig } from './integrations';

export interface SendSmsInput {
  to: string;
  body: string;
  relatedType?: string;
  relatedId?: string;
}

export interface SendSmsResult {
  success: boolean;
  status: 'sent' | 'failed' | 'logged';
  provider: 'twilio' | 'dev-log';
  messageLogId: string;
  providerId?: string;
  error?: string;
}

const E164 = /^\+[1-9]\d{6,14}$/;

export function isValidPhone(phone: string): boolean {
  return E164.test(phone.trim());
}

/** Map a Twilio error code to a safe, user-facing message (never leak secrets). */
export function twilioErrorMessage(err: unknown): string {
  const e = err as { code?: number; message?: string };
  switch (e.code) {
    case 20003:
      return 'Twilio authentication failed. Check the Account SID and Auth Token.';
    case 21211:
      return 'Invalid destination phone number.';
    case 21608:
    case 21610:
      return 'This number is unverified or has opted out (trial accounts can only text verified numbers).';
    case 20429:
      return 'Rate limit exceeded. Please try again shortly.';
    default:
      return e.message ? `SMS failed: ${e.message}` : 'SMS failed.';
  }
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const cfg = (await getIntegrationsConfig()).twilio;
  const to = input.to.trim();

  if (!isValidPhone(to)) {
    const log = await prisma.messageLog.create({
      data: {
        channel: 'sms', toAddress: to, fromAddress: cfg.fromNumber || 'unknown',
        body: input.body, status: 'failed', provider: 'dev-log',
        error: 'Invalid phone number (must be E.164, e.g. +14155550100)',
        relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    return { success: false, status: 'failed', provider: 'dev-log', messageLogId: log.id, error: 'Invalid phone number format' };
  }

  // No credentials, or test mode → dev-log transport (never send real SMS in tests).
  if (env.nodeEnv === 'test' || !cfg.enabled || !cfg.accountSid || !cfg.authToken || !cfg.fromNumber) {
    const log = await prisma.messageLog.create({
      data: {
        channel: 'sms', toAddress: to, fromAddress: cfg.fromNumber || 'dev-log',
        body: input.body, status: 'logged', provider: 'dev-log',
        relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    return { success: true, status: 'logged', provider: 'dev-log', messageLogId: log.id };
  }

  try {
    const client = twilio(cfg.accountSid, cfg.authToken);
    const msg = await client.messages.create({ from: cfg.fromNumber, to, body: input.body });
    const log = await prisma.messageLog.create({
      data: {
        channel: 'sms', toAddress: to, fromAddress: cfg.fromNumber, body: input.body,
        status: 'sent', provider: 'twilio', providerId: msg.sid,
        relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    return { success: true, status: 'sent', provider: 'twilio', messageLogId: log.id, providerId: msg.sid };
  } catch (err) {
    const message = twilioErrorMessage(err);
    const log = await prisma.messageLog.create({
      data: {
        channel: 'sms', toAddress: to, fromAddress: cfg.fromNumber, body: input.body,
        status: 'failed', provider: 'twilio', error: message,
        relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    return { success: false, status: 'failed', provider: 'twilio', messageLogId: log.id, error: message };
  }
}
