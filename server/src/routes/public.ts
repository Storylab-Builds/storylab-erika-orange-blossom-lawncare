import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';
import { parse } from '../lib/validate';
import { sendEmail } from '../services/email';
import { getIntegrationsConfig } from '../services/integrations';

const router = Router();

const quoteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  serviceType: z.string().optional().default(''),
  message: z.string().optional().default(''),
});

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

// Public "Get a Free Quote" form. Persists the lead, emails the company inbox,
// and sends the customer a confirmation. No auth required.
router.post(
  '/quote',
  asyncHandler(async (req, res) => {
    const body = parse(quoteSchema, req.body);
    const cfg = (await getIntegrationsConfig()).resend;

    const quote = await prisma.quoteRequest.create({ data: { ...body } });

    const summary = `
      <h2>New quote request</h2>
      <p><strong>Name:</strong> ${esc(body.name)}</p>
      <p><strong>Email:</strong> ${esc(body.email)}</p>
      <p><strong>Phone:</strong> ${esc(body.phone || '—')}</p>
      <p><strong>Address:</strong> ${esc(body.address || '—')}</p>
      <p><strong>Service:</strong> ${esc(body.serviceType || '—')}</p>
      <p><strong>Message:</strong><br/>${esc(body.message || '—')}</p>
      <hr/><p style="color:#888">Quote ID: ${quote.id}</p>`;

    // 1) Notify the company inbox.
    const inboxResult = await sendEmail({
      to: cfg.quoteInbox,
      subject: `New quote request from ${body.name}`,
      html: summary,
      text: `New quote request from ${body.name} (${body.email}, ${body.phone}). Service: ${body.serviceType}. ${body.message}`,
      replyTo: body.email,
      relatedType: 'quote',
      relatedId: quote.id,
    });

    // 2) Confirmation to the customer.
    await sendEmail({
      to: body.email,
      subject: 'We received your quote request — Orange Blossom Lawncare',
      html: `<p>Hi ${esc(body.name)},</p><p>Thanks for reaching out to Orange Blossom Special Lawncare!
        We received your request${body.serviceType ? ` for <strong>${esc(body.serviceType)}</strong>` : ''}
        and a team member will get back to you within one business day.</p>
        <p>— The Orange Blossom Team</p>`,
      text: `Hi ${body.name}, thanks for reaching out to Orange Blossom Special Lawncare! We received your request and will be in touch within one business day.`,
      relatedType: 'quote',
      relatedId: quote.id,
    });

    await prisma.quoteRequest.update({
      where: { id: quote.id },
      data: { emailLogId: inboxResult.messageLogId },
    });

    res.status(201).json({
      ok: true,
      quoteId: quote.id,
      delivery: inboxResult.status, // sent | logged | failed
      message:
        inboxResult.status === 'sent'
          ? 'Quote request sent! We will be in touch within one business day.'
          : 'Quote request received! We will be in touch within one business day.',
    });
  }),
);

export default router;
