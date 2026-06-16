import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';

const router = Router();

router.get(
  '/daily-metrics',
  asyncHandler(async (req, res) => {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    const all = await prisma.dailyMetric.findMany({ orderBy: { date: 'asc' } });
    res.json(all.slice(-days));
  }),
);

router.get(
  '/crew-utilization',
  asyncHandler(async (_req, res) => {
    const crews = await prisma.crew.findMany({ orderBy: { name: 'asc' } });
    res.json(
      crews.map((c) => ({
        crewId: c.id,
        crewName: c.name,
        todayJobs: c.todayJobsCount,
        todayCompleted: c.todayJobsCompleted,
        efficiency: c.efficiency,
        status: c.status,
        zone: c.serviceZone,
      })),
    );
  }),
);

export default router;
