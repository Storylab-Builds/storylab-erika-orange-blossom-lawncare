// Email service via Resend. Sends a real email when a Resend API key is configured
// (DB Setting or env), logs every attempt to MessageLog, and degrades to a "dev-log"
// transport when unconfigured so flows (quote requests, password reset, notifications)
// keep working locally. Drop a key in Settings -> Integrations to go live.

import { Resend } from 'resend';
import { prisma } from '../db';
import { getIntegrationsConfig } from './integrations';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  relatedType?: string;
  relatedId?: string;
}

export interface SendEmailResult {
  success: boolean;
  status: 'sent' | 'failed' | 'logged';
  provider: 'resend' | 'dev-log';
  messageLogId: string;
  providerId?: string;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const cfg = (await getIntegrationsConfig()).resend;
  const to = input.to.trim();

  if (!isValidEmail(to)) {
    const log = await prisma.messageLog.create({
      data: {
        channel: 'email', toAddress: to, fromAddress: cfg.from, subject: input.subject,
        body: input.text || input.html, status: 'failed', provider: 'dev-log',
        error: 'Invalid email address', relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    return { success: false, status: 'failed', provider: 'dev-log', messageLogId: log.id, error: 'Invalid email address' };
  }

  // No API key → dev-log transport (records so it is visible in the app + history).
  if (!cfg.enabled || !cfg.apiKey) {
    const log = await prisma.messageLog.create({
      data: {
        channel: 'email', toAddress: to, fromAddress: cfg.from, subject: input.subject,
        body: input.text || input.html, status: 'logged', provider: 'dev-log',
        relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    // eslint-disable-next-line no-console
    console.log(`[email:dev-log] to=${to} subject="${input.subject}" (no RESEND_API_KEY — not delivered)`);
    return { success: true, status: 'logged', provider: 'dev-log', messageLogId: log.id };
  }

  try {
    const resend = new Resend(cfg.apiKey);
    const { data, error } = await resend.emails.send({
      from: cfg.from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (error) throw new Error(error.message);
    const log = await prisma.messageLog.create({
      data: {
        channel: 'email', toAddress: to, fromAddress: cfg.from, subject: input.subject,
        body: input.text || input.html, status: 'sent', provider: 'resend', providerId: data?.id,
        relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    return { success: true, status: 'sent', provider: 'resend', messageLogId: log.id, providerId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email failed';
    const log = await prisma.messageLog.create({
      data: {
        channel: 'email', toAddress: to, fromAddress: cfg.from, subject: input.subject,
        body: input.text || input.html, status: 'failed', provider: 'resend', error: message,
        relatedType: input.relatedType, relatedId: input.relatedId,
      },
    });
    return { success: false, status: 'failed', provider: 'resend', messageLogId: log.id, error: message };
  }
}
