import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const activities = await prisma.activity.findMany({ orderBy: { timestamp: 'desc' }, take: limit });
    res.json(activities);
  }),
);

export default router;
