import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler, ApiError } from '../lib/http';
import { parse } from '../lib/validate';

const router = Router();
const withRels = { members: true, equipment: true } as const;

const memberSchema = z.object({
  name: z.string().min(1),
  role: z.string().default('technician'),
  phone: z.string().default(''),
});

const crewCreate = z.object({
  name: z.string().min(1),
  serviceZone: z.string().default(''),
  status: z.string().default('available'),
  specialties: z.array(z.string()).default([]),
  efficiency: z.number().int().default(85),
  members: z.array(memberSchema).default([]),
});

const crewUpdate = z
  .object({
    name: z.string().min(1),
    serviceZone: z.string(),
    status: z.string(),
    specialties: z.array(z.string()),
    efficiency: z.number().int(),
    todayJobsCount: z.number().int(),
    todayJobsCompleted: z.number().int(),
  })
  .partial();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const crews = await prisma.crew.findMany({ include: withRels, orderBy: { name: 'asc' } });
    res.json(crews);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(crewCreate, req.body);
    const crew = await prisma.crew.create({
      data: {
        name: body.name,
        serviceZone: body.serviceZone,
        status: body.status,
        specialties: body.specialties,
        efficiency: body.efficiency,
        members: { create: body.members },
      },
      include: withRels,
    });
    res.status(201).json(crew);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parse(crewUpdate, req.body);
    const existing = await prisma.crew.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, 'Crew not found');
    const crew = await prisma.crew.update({ where: { id: req.params.id }, data: body, include: withRels });
    res.json(crew);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      await prisma.crew.delete({ where: { id: req.params.id } });
    } catch {
      throw new ApiError(404, 'Crew not found');
    }
    res.json({ ok: true });
  }),
);

router.post(
  '/:id/members',
  asyncHandler(async (req, res) => {
    const body = parse(memberSchema, req.body);
    const crew = await prisma.crew.findUnique({ where: { id: req.params.id } });
    if (!crew) throw new ApiError(404, 'Crew not found');
    await prisma.employee.create({ data: { ...body, crewId: req.params.id } });
    const updated = await prisma.crew.findUnique({ where: { id: req.params.id }, include: withRels });
    res.status(201).json(updated);
  }),
);

router.patch(
  '/:id/members/:memberId',
  asyncHandler(async (req, res) => {
    const body = parse(memberSchema.partial(), req.body);
    try {
      await prisma.employee.update({ where: { id: req.params.memberId }, data: body });
    } catch {
      throw new ApiError(404, 'Member not found');
    }
    const updated = await prisma.crew.findUnique({ where: { id: req.params.id }, include: withRels });
    res.json(updated);
  }),
);

router.delete(
  '/:id/members/:memberId',
  asyncHandler(async (req, res) => {
    try {
      await prisma.employee.delete({ where: { id: req.params.memberId } });
    } catch {
      throw new ApiError(404, 'Member not found');
    }
    const updated = await prisma.crew.findUnique({ where: { id: req.params.id }, include: withRels });
    res.json(updated);
  }),
);

export default router;
