import { Router } from 'express';
import { format, subDays } from 'date-fns';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';

const router = Router();

const DEFAULT_JOB_PRICE = 75;

/**
 * Estimate revenue for a set of jobs using a serviceType -> average
 * ServiceAgreement price map. Falls back to DEFAULT_JOB_PRICE when no
 * agreement exists for that serviceType.
 */
function estimateRevenue(
  jobs: { serviceType: string }[],
  priceByServiceType: Map<string, number>,
): number {
  return jobs.reduce(
    (sum, job) => sum + (priceByServiceType.get(job.serviceType) ?? DEFAULT_JOB_PRICE),
    0,
  );
}

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let todaysJobs = await prisma.job.findMany({ where: { scheduledDate: today } });
    if (todaysJobs.length === 0) {
      const latest = await prisma.job.findFirst({ orderBy: { scheduledDate: 'desc' } });
      if (latest) todaysJobs = await prisma.job.findMany({ where: { scheduledDate: latest.scheduledDate } });
    }

    // scheduledDate is stored as a yyyy-MM-dd string, so lexicographic
    // comparison is equivalent to chronological comparison.
    const last7Start = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const prev7Start = format(subDays(new Date(), 14), 'yyyy-MM-dd');

    const [crews, activeCustomers, pendingNotifications, agreements, last7Jobs, prev7Jobs] =
      await Promise.all([
        prisma.crew.findMany(),
        prisma.customer.count({ where: { status: 'active' } }),
        prisma.notification.count({ where: { status: 'pending' } }),
        prisma.serviceAgreement.findMany({ select: { serviceType: true, price: true } }),
        // jobs in the last 7 days (today inclusive, back to last7Start)
        prisma.job.findMany({
          where: { scheduledDate: { gte: last7Start, lte: today } },
          select: { serviceType: true },
        }),
        // jobs in the prior 7 days (the week before last7Start)
        prisma.job.findMany({
          where: { scheduledDate: { gte: prev7Start, lt: last7Start } },
          select: { serviceType: true },
        }),
      ]);

    // Build serviceType -> average agreement price map.
    const priceSums = new Map<string, { total: number; count: number }>();
    for (const a of agreements) {
      const entry = priceSums.get(a.serviceType) ?? { total: 0, count: 0 };
      entry.total += a.price;
      entry.count += 1;
      priceSums.set(a.serviceType, entry);
    }
    const priceByServiceType = new Map<string, number>();
    for (const [serviceType, { total, count }] of priceSums) {
      priceByServiceType.set(serviceType, count > 0 ? total / count : DEFAULT_JOB_PRICE);
    }

    const weeklyRevenue = Math.round(estimateRevenue(last7Jobs, priceByServiceType));
    const prevRevenue = Math.round(estimateRevenue(prev7Jobs, priceByServiceType));
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
