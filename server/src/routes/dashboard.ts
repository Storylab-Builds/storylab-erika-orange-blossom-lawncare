import { Router } from 'express';
import { format } from 'date-fns';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';

const router = Router();

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let todaysJobs = await prisma.job.findMany({ where: { scheduledDate: today } });
    if (todaysJobs.length === 0) {
      const latest = await prisma.job.findFirst({ orderBy: { scheduledDate: 'desc' } });
      if (latest) todaysJobs = await prisma.job.findMany({ where: { scheduledDate: latest.scheduledDate } });
    }

    const [crews, activeCustomers, pendingNotifications, metrics] = await Promise.all([
      prisma.crew.findMany(),
      prisma.customer.count({ where: { status: 'active' } }),
      prisma.notification.count({ where: { status: 'pending' } }),
      prisma.dailyMetric.findMany({ orderBy: { date: 'asc' } }),
    ]);

    const last7 = metrics.slice(-7);
    const prev7 = metrics.slice(-14, -7);
    const weeklyRevenue = last7.reduce((s, m) => s + m.revenue, 0);
    const prevRevenue = prev7.reduce((s, m) => s + m.revenue, 0);
    const weeklyRevenueChange =
      prevRevenue > 0 ? Number((((weeklyRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)) : 0;

    res.json({
      todayJobs: todaysJobs.length,
      todayCompleted: todaysJobs.filter((j) => j.status === 'completed').length,
      activeCrews: crews.filter((c) => c.status !== 'off-duty').length,
      totalCrews: crews.length,
      weeklyRevenue,
      weeklyRevenueChange,
      activeCustomers,
      weatherImpact: 'low',
      pendingNotifications,
    });
  }),
);

export default router;
