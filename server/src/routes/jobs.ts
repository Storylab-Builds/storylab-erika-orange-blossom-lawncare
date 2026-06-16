import { Router } from 'express';
import { z } from 'zod';
import { format } from 'date-fns';
import { prisma } from '../db';
import { asyncHandler, ApiError } from '../lib/http';
import { parse } from '../lib/validate';

const router = Router();

const jobCreate = z.object({
  serviceAgreementId: z.string().optional(),
  customerId: z.string(),
  customerName: z.string(),
  propertyAddress: z.string(),
  serviceType: z.string(),
  scheduledDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  crewId: z.string().optional(),
  crewName: z.string().default(''),
  status: z.string().default('scheduled'),
  priority: z.string().default('normal'),
  notes: z.string().optional(),
  weatherAffected: z.boolean().default(false),
});

const jobUpdate = jobCreate.partial();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { date, crewId } = req.query as { date?: string; crewId?: string };
    const jobs = await prisma.job.findMany({
      where: { ...(date ? { scheduledDate: date } : {}), ...(crewId ? { crewId } : {}) },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
    });
    res.json(jobs);
  }),
);

// NOTE: must be declared before '/:id'
router.get(
  '/today',
  asyncHandler(async (_req, res) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let jobs = await prisma.job.findMany({ where: { scheduledDate: today }, orderBy: { startTime: 'asc' } });
    if (jobs.length === 0) {
      // Fallback so the dashboard is never empty across days: use the most recent seeded day.
      const latest = await prisma.job.findFirst({ orderBy: { scheduledDate: 'desc' } });
      if (latest) {
        jobs = await prisma.job.findMany({
          where: { scheduledDate: latest.scheduledDate },
          orderBy: { startTime: 'asc' },
        });
      }
    }
    res.json(jobs);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) throw new ApiError(404, 'Job not found');
    res.json(job);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(jobCreate, req.body);
    const job = await prisma.job.create({ data: body });
    res.status(201).json(job);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parse(jobUpdate, req.body);
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, 'Job not found');
    const data: Record<string, unknown> = { ...body };
    if (body.status === 'completed' && !existing.completedAt) {
      data.completedAt = new Date().toISOString();
    }
    const job = await prisma.job.update({ where: { id: req.params.id }, data });
    res.json(job);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      await prisma.job.delete({ where: { id: req.params.id } });
    } catch {
      throw new ApiError(404, 'Job not found');
    }
    res.json({ ok: true });
  }),
);

export default router;
