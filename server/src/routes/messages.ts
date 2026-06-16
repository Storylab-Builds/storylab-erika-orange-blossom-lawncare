import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';
import { parse } from '../lib/validate';
import { requireRole } from '../middleware/auth';
import { sendSms } from '../services/twilio';

const router = Router();

// Unified outbound message audit log (SMS + email).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
    const logs = await prisma.messageLog.findMany({
      where: channel ? { channel } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(logs);
  }),
);

const testSmsSchema = z.object({
  to: z.string().min(1),
  body: z.string().min(1).default('Test message from Orange Blossom Lawncare ✅'),
});

// Send a real test SMS (owner/admin). Used to verify the Twilio integration.
router.post(
  '/test-sms',
  requireRole('OWNER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const body = parse(testSmsSchema, req.body);
    const result = await sendSms({ to: body.to, body: body.body, relatedType: 'test' });
    res.status(result.success ? 200 : 502).json(result);
  }),
);

// --- Quote-request leads (from the public marketing form) ---

router.get(
  '/quotes',
  asyncHandler(async (_req, res) => {
    const quotes = await prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    res.json(quotes);
  }),
);

const quoteStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']),
});

router.patch(
  '/quotes/:id',
  asyncHandler(async (req, res) => {
    const body = parse(quoteStatusSchema, req.body);
    const quote = await prisma.quoteRequest.update({ where: { id: req.params.id }, data: body });
    res.json(quote);
  }),
);

export default router;
