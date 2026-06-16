import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { format, subDays, addDays } from 'date-fns';
import { PrismaClient, type Prisma } from '@prisma/client';
import {
  customers,
  crews,
  weatherData,
  notifications,
  activities,
} from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  // Reset (children deleted via cascade where applicable; standalone tables wiped directly).
  await prisma.$transaction([
    prisma.serviceAgreement.deleteMany(),
    prisma.property.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.equipment.deleteMany(),
    prisma.crew.deleteMany(),
    prisma.job.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.dailyMetric.deleteMany(),
    prisma.weatherSnapshot.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.messageLog.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.quoteRequest.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // --- Users (default login accounts) ---
  const passwordHash = await bcrypt.hash('Password123!', 10);
  await prisma.user.createMany({
    data: [
      { email: 'owner@orangeblossom.com', name: 'Erika Hartvickson', passwordHash, role: 'OWNER' },
      { email: 'admin@orangeblossom.com', name: 'Jake Davidson', passwordHash, role: 'ADMIN' },
      { email: 'crew@orangeblossom.com', name: 'Marcus Johnson', passwordHash, role: 'CREW' },
    ],
  });

  // --- Customers + Properties + Service Agreements ---
  for (const c of customers) {
    await prisma.customer.create({
      data: {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        state: c.state,
        zip: c.zip,
        status: c.status,
        notes: c.notes ?? '',
        preferredContact: c.preferredContact,
        createdAt: c.createdAt,
        properties: {
          create: (c.properties ?? []).map((p) => ({
            id: p.id,
            address: p.address,
            lotSize: p.lotSize,
            features: p.features ?? [],
            gateCode: p.gateCode,
            accessInstructions: p.accessInstructions,
            services: {
              create: (p.services ?? []).map((s) => ({
                id: s.id,
                serviceType: s.serviceType,
                frequency: s.frequency,
                estimatedDuration: s.estimatedDuration,
                price: s.price,
                seasonStart: s.seasonStart,
                seasonEnd: s.seasonEnd,
                specialInstructions: s.specialInstructions,
                status: s.status,
                nextScheduledDate: s.nextScheduledDate,
              })),
            },
          })),
        },
      },
    });
  }

  // --- Crews + Employees + Equipment ---
  for (const cr of crews) {
    await prisma.crew.create({
      data: {
        id: cr.id,
        name: cr.name,
        specialties: cr.specialties ?? [],
        status: cr.status,
        serviceZone: cr.serviceZone,
        todayJobsCount: cr.todayJobsCount ?? 0,
        todayJobsCompleted: cr.todayJobsCompleted ?? 0,
        efficiency: cr.efficiency ?? 85,
        members: {
          create: (cr.members ?? []).map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            phone: m.phone,
            clockedIn: m.clockedIn ?? false,
            clockInTime: m.clockInTime,
            onBreak: m.onBreak ?? false,
          })),
        },
        equipment: {
          create: (cr.equipment ?? []).map((e) => ({
            id: e.id,
            name: e.name,
            type: e.type,
            status: e.status,
          })),
        },
      },
    });
  }

  // --- Jobs (denormalized, REALISTIC distribution) ---
  // Generated deterministically across a window of 56 days back -> 14 days forward,
  // tied to real customers/properties/service-agreements and crews. Per-day counts
  // vary by weekday + a gentle wave so "jobs this week" is never a flat line.
  // DailyMetrics below are DERIVED from these same jobs so dashboard/reports agree.

  // Deterministic pseudo-random in [0,1) from an integer seed (no Math.random).
  const rand = (seed: number): number => {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  // Flatten customers -> a pool of (customer, property, service) work items.
  type WorkItem = {
    serviceAgreementId: string;
    customerId: string;
    customerName: string;
    propertyAddress: string;
    serviceType: string;
    estimatedDuration: number;
  };
  const pool: WorkItem[] = [];
  for (const c of customers) {
    for (const p of c.properties ?? []) {
      for (const s of p.services ?? []) {
        pool.push({
          serviceAgreementId: s.id,
          customerId: c.id,
          customerName: c.name,
          propertyAddress: p.address,
          serviceType: s.serviceType,
          estimatedDuration: s.estimatedDuration,
        });
      }
    }
  }

  const crewList = crews.map((c) => ({ id: c.id, name: c.name }));
  const slots = [
    ['07:00', '08:30'], ['08:45', '10:15'], ['10:30', '12:00'],
    ['13:00', '14:30'], ['14:45', '16:15'], ['16:30', '18:00'],
  ];
  const priorities = ['normal', 'normal', 'normal', 'high', 'low'];

  // Per-day metric accumulators (date -> derived metric).
  const metricByDate = new Map<
    string,
    { revenue: number; jobsCompleted: number; jobsScheduled: number }
  >();

  const PRICE_BY_TYPE: Record<string, number> = {};
  for (const c of customers)
    for (const p of c.properties ?? [])
      for (const s of p.services ?? []) PRICE_BY_TYPE[s.serviceType] = s.price;

  const jobRows: Prisma.JobCreateManyInput[] = [];
  let poolCursor = 0;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  for (let offset = 56; offset >= -14; offset--) {
    const day = offset >= 0 ? subDays(new Date(), offset) : addDays(new Date(), -offset);
    const scheduledDate = format(day, 'yyyy-MM-dd');
    const dow = day.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isFuture = scheduledDate > todayStr;
    const isToday = scheduledDate === todayStr;

    // Varied per-day count: weekday base 5-8, weekend 0-2, plus a wave.
    const wave = Math.round(2 * Math.sin(offset / 2.3));
    const base = isWeekend ? 1 : 6;
    const jitter = Math.floor(rand(offset + 7) * 3); // 0..2
    let count = Math.max(0, base + wave + jitter - (isWeekend ? 1 : 0));
    if (isWeekend && rand(offset) < 0.4) count = 0; // some weekends are off entirely
    count = Math.min(count, slots.length);

    let dayRevenue = 0;
    let dayCompleted = 0;

    for (let k = 0; k < count; k++) {
      const item = pool[poolCursor % pool.length];
      poolCursor++;
      const crew = crewList[(offset + k) % crewList.length];
      const [startTime, endTime] = slots[k % slots.length];
      const price = PRICE_BY_TYPE[item.serviceType] ?? 75;

      // Status by date: past = completed (a few weather-affected); today = mix; future = scheduled.
      let status = 'scheduled';
      let completedAt: string | null = null;
      let actualDuration: number | null = null;
      const weatherAffected = !isFuture && rand(offset * 31 + k) < 0.07;
      if (!isFuture && !isToday) {
        status = 'completed';
        completedAt = `${scheduledDate}T${endTime}:00`;
        actualDuration = item.estimatedDuration + Math.round((rand(offset * 13 + k) - 0.5) * 20);
      } else if (isToday) {
        if (k === 0) status = 'in-progress';
        else if (k < 2) {
          status = 'completed';
          completedAt = `${scheduledDate}T${endTime}:00`;
          actualDuration = item.estimatedDuration;
        } else status = 'scheduled';
      }

      if (status === 'completed') {
        dayRevenue += price;
        dayCompleted++;
      }

      jobRows.push({
        id: `job-${scheduledDate}-${k}`,
        serviceAgreementId: item.serviceAgreementId,
        customerId: item.customerId,
        customerName: item.customerName,
        propertyAddress: item.propertyAddress,
        serviceType: item.serviceType,
        scheduledDate,
        startTime,
        endTime,
        crewId: crew?.id ?? null,
        crewName: crew?.name ?? 'Unassigned',
        status,
        priority: priorities[(offset + k) % priorities.length],
        notes: null,
        completedAt,
        actualDuration,
        weatherAffected,
      });
    }

    metricByDate.set(scheduledDate, {
      revenue: dayRevenue,
      jobsCompleted: dayCompleted,
      jobsScheduled: count,
    });
  }

  await prisma.job.createMany({ data: jobRows });

  // Set each crew's today counts from the generated "today" jobs.
  const todaysJobs = jobRows.filter((j) => j.scheduledDate === todayStr);
  for (const crew of crews) {
    const mine = todaysJobs.filter((j) => j.crewId === crew.id);
    await prisma.crew.update({
      where: { id: crew.id },
      data: {
        todayJobsCount: mine.length,
        todayJobsCompleted: mine.filter((j) => j.status === 'completed').length,
      },
    });
  }

  // --- Notifications ---
  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        id: n.id,
        customerId: n.customerId,
        customerName: n.customerName,
        type: n.type,
        channel: n.channel,
        message: n.message,
        status: n.status,
        sentAt: n.sentAt,
      },
    });
  }

  // --- Activities ---
  for (const a of activities) {
    await prisma.activity.create({
      data: {
        id: a.id,
        type: a.type,
        description: a.description,
        timestamp: a.timestamp,
        entityId: a.entityId,
        entityType: a.entityType,
      },
    });
  }

  // --- Daily metrics: DERIVED from the generated jobs (dashboard/reports agree) ---
  // Covers the last 90 days; days with jobs use real counts, gaps fall back to a
  // deterministic estimate so charts have a continuous axis.
  const metrics: Prisma.DailyMetricCreateManyInput[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const date = format(d, 'yyyy-MM-dd');
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const derived = metricByDate.get(date);
    const jobsScheduled = derived?.jobsScheduled ?? (isWeekend ? 1 : 5);
    const jobsCompleted = derived?.jobsCompleted ?? Math.max(0, jobsScheduled - 1);
    const revenue = derived?.revenue ?? jobsCompleted * 90;
    const utilBase = jobsScheduled === 0 ? 0 : Math.min(98, 60 + jobsCompleted * 6);
    metrics.push({
      date,
      revenue,
      jobsCompleted,
      jobsScheduled,
      crewUtilization: utilBase,
      customerSatisfaction: Number((4.5 + (i % 5) * 0.08).toFixed(1)),
    });
  }
  await prisma.dailyMetric.createMany({ data: metrics });

  // --- Weather snapshot ---
  await prisma.weatherSnapshot.create({
    data: { id: 1, data: weatherData as unknown as Prisma.InputJsonValue },
  });

  // --- Default settings ---
  await prisma.setting.createMany({
    data: [
      {
        key: 'company',
        value: {
          name: 'Orange Blossom Special Lawncare',
          phone: '(330) 555-1234',
          email: 'hello@orangeblossom.com',
          address: 'Northeast Ohio',
          timezone: 'America/New_York',
        },
      },
      {
        key: 'workingHours',
        value: { start: '07:00', end: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      },
      {
        key: 'notifications',
        value: {
          templates: {
            'appointment-reminder': 'Hi {{name}}, this is a reminder that {{crew}} will service {{address}} on {{date}}.',
            'on-the-way': 'Hi {{name}}, your Orange Blossom crew is on the way and will arrive shortly.',
            'job-complete': 'Hi {{name}}, your lawn service at {{address}} is complete. Thanks for choosing Orange Blossom!',
          },
        },
      },
      {
        // Integration credentials. Secrets resolve from here first, then .env.
        // Stored blank by default — real values live in .env for local dev and
        // can be entered/overridden in Settings -> Integrations.
        key: 'integrations',
        value: {
          twilio: { accountSid: '', authToken: '', fromNumber: '', enabled: true },
          resend: { apiKey: '', from: 'Orange Blossom Lawncare <onboarding@resend.dev>', quoteInbox: 'hello@orangeblossom.com', enabled: true },
          notifications: { smsEnabled: true, emailEnabled: true },
        },
      },
    ],
  });

  // --- Sample quote-request leads (from the public marketing form) ---
  await prisma.quoteRequest.createMany({
    data: [
      { name: 'Brenda Coyle', email: 'brenda.coyle@example.com', phone: '+13305550148', address: '88 Maple Grove Ln, Hudson, OH', serviceType: 'lawn-mowing', message: 'Weekly mowing for a half-acre lot.', status: 'new' },
      { name: 'Tom Reilly', email: 'tom.reilly@example.com', phone: '+13305550172', address: '14 Birch St, Stow, OH', serviceType: 'landscaping', message: 'Spring cleanup and mulch.', status: 'contacted' },
      { name: 'Priya Nadar', email: 'priya.nadar@example.com', phone: '+13305550193', address: '410 Oakwood Dr, Kent, OH', serviceType: 'fertilization', message: 'Quote for a seasonal fertilization plan.', status: 'quoted' },
    ],
  });

  console.log('Seed complete:', {
    users: 3,
    customers: customers.length,
    crews: crews.length,
    jobs: jobRows.length,
    notifications: notifications.length,
    activities: activities.length,
    metrics: metrics.length,
    quotes: 3,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
