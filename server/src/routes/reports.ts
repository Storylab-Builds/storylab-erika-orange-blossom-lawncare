import { Router } from 'express';
import { format, subDays } from 'date-fns';
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

/**
 * Live jobs time-series derived from the Job table, grouped by scheduledDate.
 * Returns one entry per day for the last `days` days (oldest first), with
 * scheduled (total jobs that day) and completed (status === 'completed') counts.
 * Days with no jobs are included with zero counts so the chart has a
 * continuous x-axis.
 */
router.get(
  '/jobs-series',
  asyncHandler(async (req, res) => {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
    const today = new Date();
    const startDate = format(subDays(today, days - 1), 'yyyy-MM-dd');
    const endDate = format(today, 'yyyy-MM-dd');

    // scheduledDate is a yyyy-MM-dd string -> lexicographic range query works.
    const jobs = await prisma.job.findMany({
      where: { scheduledDate: { gte: startDate, lte: endDate } },
      select: { scheduledDate: true, status: true },
    });

    const counts = new Map<string, { scheduled: number; completed: number }>();
    for (const job of jobs) {
      const entry = counts.get(job.scheduledDate) ?? { scheduled: 0, completed: 0 };
      entry.scheduled += 1;
      if (job.status === 'completed') entry.completed += 1;
      counts.set(job.scheduledDate, entry);
    }

    const series = Array.from({ length: days }, (_, i) => {
      const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd');
      const entry = counts.get(date) ?? { scheduled: 0, completed: 0 };
      return { date, scheduled: entry.scheduled, completed: entry.completed };
    });

    res.json(series);
  }),
);

export default router;
