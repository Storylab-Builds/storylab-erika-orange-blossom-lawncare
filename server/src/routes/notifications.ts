import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';
import { parse } from '../lib/validate';

const router = Router();

const notificationCreate = z.object({
  customerId: z.string(),
  customerName: z.string(),
  type: z.string().default('reminder'),
  channel: z.enum(['sms', 'email', 'push']),
  message: z.string().min(1),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const notifications = await prisma.notification.findMany({ orderBy: { sentAt: 'desc' } });
    res.json(notifications);
  }),
);

// Records an outbound message. External SMS/email delivery (Twilio/Resend) is a
// blocked integration (needs accounts/keys) — this persists the record and marks it sent.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(notificationCreate, req.body);
    const notification = await prisma.notification.create({
      data: { ...body, status: 'sent', sentAt: new Date().toISOString() },
    });
    res.status(201).json(notification);
  }),
);

export default router;
