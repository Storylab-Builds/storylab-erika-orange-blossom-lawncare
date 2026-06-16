import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';
import { parse } from '../lib/validate';
import { requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany();
    const settings: Record<string, unknown> = {};
    for (const row of rows) settings[row.key] = row.value;
    res.json(settings);
  }),
);

const upsertSchema = z.object({ value: z.unknown() });

// Only owners/admins may change settings.
router.put(
  '/:key',
  requireRole('OWNER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { value } = parse(upsertSchema, req.body);
    const row = await prisma.setting.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value: value as object },
      update: { value: value as object },
    });
    res.json(row);
  }),
);

export default router;
