import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { format, subDays } from 'date-fns';
import { PrismaClient, type Prisma } from '@prisma/client';
import {
  customers,
  crews,
  todayJobs,
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

  // --- Jobs (denormalized) ---
  for (const j of todayJobs) {
    await prisma.job.create({
      data: {
        id: j.id,
        serviceAgreementId: j.serviceAgreementId,
        customerId: j.customerId,
        customerName: j.customerName,
        propertyAddress: j.propertyAddress,
        serviceType: j.serviceType,
        scheduledDate: j.scheduledDate,
        startTime: j.startTime,
        endTime: j.endTime,
        crewId: j.crewId,
        crewName: j.crewName,
        status: j.status,
        priority: j.priority,
        notes: j.notes,
        completedAt: j.completedAt,
        actualDuration: j.actualDuration,
        weatherAffected: j.weatherAffected ?? false,
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

  // --- Daily metrics: DETERMINISTIC (no Math.random) ---
  const metrics: Prisma.DailyMetricCreateManyInput[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const date = format(d, 'yyyy-MM-dd');
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const wave = Math.round(3 * Math.sin(i / 3)); // deterministic gentle variation
    const jobsScheduled = isWeekend ? 9 : 23;
    const jobsCompleted = Math.min(jobsScheduled, Math.max(4, jobsScheduled - 2 + (wave % 2)));
    const revenue = jobsCompleted * 95 + (isWeekend ? 0 : 250) + wave * 30;
    metrics.push({
      date,
      revenue,
      jobsCompleted,
      jobsScheduled,
      crewUtilization: isWeekend ? 72 : 88 + (wave % 3),
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
    ],
  });

  console.log('Seed complete:', {
    users: 3,
    customers: customers.length,
    crews: crews.length,
    jobs: todayJobs.length,
    notifications: notifications.length,
    activities: activities.length,
    metrics: metrics.length,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
