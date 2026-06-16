import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler, ApiError } from '../lib/http';
import { parse } from '../lib/validate';

const router = Router();
const withProps = { properties: { include: { services: true } } } as const;

const serviceSchema = z.object({
  serviceType: z.string(),
  frequency: z.string(),
  estimatedDuration: z.number().int(),
  price: z.number(),
  seasonStart: z.string().optional(),
  seasonEnd: z.string().optional(),
  specialInstructions: z.string().optional(),
  status: z.string().default('active'),
  nextScheduledDate: z.string().optional(),
});

const propertySchema = z.object({
  address: z.string(),
  lotSize: z.number().int(),
  features: z.array(z.string()).default([]),
  gateCode: z.string().optional(),
  accessInstructions: z.string().optional(),
  services: z.array(serviceSchema).default([]),
});

const customerCreate = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  status: z.enum(['active', 'inactive', 'prospect']).default('prospect'),
  notes: z.string().default(''),
  preferredContact: z.enum(['phone', 'email', 'sms']).default('email'),
  properties: z.array(propertySchema).default([]),
});

const customerUpdate = customerCreate.omit({ properties: true }).partial();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = (req.query.search as string | undefined)?.toLowerCase();
    const status = req.query.status as string | undefined;
    let customers = await prisma.customer.findMany({ include: withProps, orderBy: { name: 'asc' } });
    if (status && status !== 'all') customers = customers.filter((c) => c.status === status);
    if (search) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.address.toLowerCase().includes(search),
      );
    }
    res.json(customers);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id }, include: withProps });
    if (!customer) throw new ApiError(404, 'Customer not found');
    res.json(customer);
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parse(customerCreate, req.body);
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        status: body.status,
        notes: body.notes,
        preferredContact: body.preferredContact,
        createdAt: new Date().toISOString(),
        properties: {
          create: body.properties.map((p) => ({
            address: p.address,
            lotSize: p.lotSize,
            features: p.features,
            gateCode: p.gateCode,
            accessInstructions: p.accessInstructions,
            services: { create: p.services },
          })),
        },
      },
      include: withProps,
    });
    await prisma.activity.create({
      data: {
        type: 'customer-added',
        description: `New customer added: ${customer.name}`,
        timestamp: new Date().toISOString(),
        entityId: customer.id,
        entityType: 'customer',
      },
    });
    res.status(201).json(customer);
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parse(customerUpdate, req.body);
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, 'Customer not found');
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: body, include: withProps });
    res.json(customer);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      await prisma.customer.delete({ where: { id: req.params.id } });
    } catch {
      throw new ApiError(404, 'Customer not found');
    }
    res.json({ ok: true });
  }),
);

export default router;
