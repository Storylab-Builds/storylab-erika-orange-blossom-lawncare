import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';
import { parse } from '../lib/validate';
import { sendSms } from '../services/twilio';
import { sendEmail } from '../services/email';
import { getIntegrationsConfig } from '../services/integrations';

const router = Router();

const notificationCreate = z.object({
  customerId: z.string(),
  customerName: z.string(),
  type: z.string().default('reminder'),
  channel: z.enum(['sms', 'email', 'push']),
  message: z.string().min(1),
  subject: z.string().optional(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const notifications = await prisma.notification.findMany({ orderBy: { sentAt: 'desc' } });
    res.json(notifications);
  }),
);

// Sends an outbound message through the real channel (Twilio SMS / Resend email),
// records it in MessageLog (via the service), and persists a Notification row.
// Channel toggles in Settings -> Integrations gate whether delivery is attempted.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(notificationCreate, req.body);
    const cfg = await getIntegrationsConfig();

    // Resolve the recipient from the customer record.
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });

    let status = 'sent';
    let detail: unknown = undefined;

    if (body.channel === 'sms') {
      if (!cfg.notifications.smsEnabled) {
        status = 'failed';
        detail = { error: 'SMS notifications are disabled in Settings' };
      } else if (!customer?.phone) {
        status = 'failed';
        detail = { error: 'Customer has no phone number on file' };
      } else {
        const r = await sendSms({
          to: customer.phone, body: body.message,
          relatedType: 'notification', relatedId: body.customerId,
        });
        status = r.status === 'failed' ? 'failed' : r.status === 'logged' ? 'sent' : 'delivered';
        detail = r;
      }
    } else if (body.channel === 'email') {
      if (!cfg.notifications.emailEnabled) {
        status = 'failed';
        detail = { error: 'Email notifications are disabled in Settings' };
      } else if (!customer?.email) {
        status = 'failed';
        detail = { error: 'Customer has no email on file' };
      } else {
        const r = await sendEmail({
          to: customer.email,
          subject: body.subject || `Orange Blossom Lawncare — ${body.type}`,
          html: `<p>${body.message}</p>`,
          text: body.message,
          relatedType: 'notification', relatedId: body.customerId,
        });
        status = r.status === 'failed' ? 'failed' : r.status === 'logged' ? 'sent' : 'delivered';
        detail = r;
      }
    } else {
      // push — no external provider wired; record as sent (in-app).
      status = 'sent';
    }

    const notification = await prisma.notification.create({
      data: {
        customerId: body.customerId,
        customerName: body.customerName,
        type: body.type,
        channel: body.channel,
        message: body.message,
        status,
        sentAt: new Date().toISOString(),
      },
    });

    res.status(201).json({ ...notification, delivery: detail });
  }),
);

export default router;
