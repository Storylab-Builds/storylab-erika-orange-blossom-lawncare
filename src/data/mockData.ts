import { format, subDays, addDays, subHours, subMinutes } from 'date-fns';
import type {
  Customer,
  Property,
  ServiceAgreement,
  Job,
  Crew,
  Employee,
  Equipment,
  WeatherData,
  Notification,
  Activity,
  DailyMetrics,
  DashboardStats,
} from '@/types';

// ============================================================
// Helpers
// ============================================================

const TODAY = format(new Date(), 'yyyy-MM-dd');
const NOW = new Date().toISOString();

function daysFromNow(offset: number): string {
  return format(addDays(new Date(), offset), 'yyyy-MM-dd');
}

function hoursAgo(hours: number): string {
  return subHours(new Date(), hours).toISOString();
}

function minutesAgo(minutes: number): string {
  return subMinutes(new Date(), minutes).toISOString();
}

// ============================================================
// Employees
// ============================================================

export const employees: Employee[] = [
  { id: 'emp-01', name: 'Marcus Johnson', role: 'crew-lead', phone: '(330) 555-0101', clockedIn: true, clockInTime: `${TODAY}T06:45:00`, onBreak: false },
  { id: 'emp-02', name: 'Tyler Reed', role: 'technician', phone: '(330) 555-0102', clockedIn: true, clockInTime: `${TODAY}T06:50:00`, onBreak: false },
  { id: 'emp-03', name: 'Jordan Blake', role: 'driver', phone: '(330) 555-0103', clockedIn: true, clockInTime: `${TODAY}T06:55:00`, onBreak: false },
  { id: 'emp-04', name: 'Sofia Martinez', role: 'crew-lead', phone: '(330) 555-0104', clockedIn: true, clockInTime: `${TODAY}T07:00:00`, onBreak: false },
  { id: 'emp-05', name: 'Derek Washington', role: 'technician', phone: '(330) 555-0105', clockedIn: true, clockInTime: `${TODAY}T07:05:00`, onBreak: true },
  { id: 'emp-06', name: 'Hannah Lopez', role: 'technician', phone: '(330) 555-0106', clockedIn: true, clockInTime: `${TODAY}T07:10:00`, onBreak: false },
  { id: 'emp-07', name: 'Caleb Foster', role: 'crew-lead', phone: '(330) 555-0107', clockedIn: true, clockInTime: `${TODAY}T06:40:00`, onBreak: false },
  { id: 'emp-08', name: 'Brandon Kim', role: 'driver', phone: '(330) 555-0108', clockedIn: true, clockInTime: `${TODAY}T06:50:00`, onBreak: false },
  { id: 'emp-09', name: 'Alyssa Turner', role: 'technician', phone: '(330) 555-0109', clockedIn: false, onBreak: false },
  { id: 'emp-10', name: 'Ryan Cooper', role: 'technician', phone: '(330) 555-0110', clockedIn: true, clockInTime: `${TODAY}T07:15:00`, onBreak: false },
];

// ============================================================
// Equipment
// ============================================================

export const equipment: Equipment[] = [
  { id: 'equip-01', name: 'Hustler X-ONE 60"', type: 'zero-turn-mower', status: 'in-use' },
  { id: 'equip-02', name: 'Hustler X-ONE 54"', type: 'zero-turn-mower', status: 'in-use' },
  { id: 'equip-03', name: 'Wright Stander B 48"', type: 'stand-on-mower', status: 'in-use' },
  { id: 'equip-04', name: 'Sure-Trac 7x14 Dump', type: 'dump-trailer', status: 'in-use' },
  { id: 'equip-05', name: 'Bobcat S70 Skid Steer', type: 'skid-steer', status: 'available' },
  { id: 'equip-06', name: 'Boss V-Plow 8\'2"', type: 'snow-plow', status: 'available' },
  { id: 'equip-07', name: 'Stihl BR 800 C-E', type: 'leaf-blower', status: 'in-use' },
  { id: 'equip-08', name: 'Stihl FC 96 Edger', type: 'edger', status: 'in-use' },
  { id: 'equip-09', name: 'Stihl FS 131 Trimmer', type: 'trimmer', status: 'in-use' },
  { id: 'equip-10', name: 'Sure-Trac 6x12 Dump', type: 'dump-trailer', status: 'available' },
  { id: 'equip-11', name: 'Stihl BR 700 Blower', type: 'leaf-blower', status: 'in-use' },
  { id: 'equip-12', name: 'Stihl FS 111 Trimmer', type: 'trimmer', status: 'in-use' },
];

// ============================================================
// Crews
// ============================================================

export const crews: Crew[] = [
  {
    id: 'crew-alpha',
    name: 'Alpha Crew',
    members: [employees[0], employees[1], employees[2]],
    specialties: ['mowing', 'fertilization', 'bed-maintenance'],
    equipment: [equipment[0], equipment[3], equipment[6], equipment[7], equipment[8]],
    status: 'on-job',
    serviceZone: 'Akron / West Akron',
    todayJobsCount: 8,
    todayJobsCompleted: 4,
    efficiency: 92,
  },
  {
    id: 'crew-bravo',
    name: 'Bravo Crew',
    members: [employees[3], employees[4], employees[5]],
    specialties: ['landscaping', 'mulching', 'shrub-trimming', 'bed-maintenance'],
    equipment: [equipment[2], equipment[4], equipment[10], equipment[11]],
    status: 'on-job',
    serviceZone: 'Medina / Wadsworth',
    todayJobsCount: 7,
    todayJobsCompleted: 3,
    efficiency: 88,
  },
  {
    id: 'crew-charlie',
    name: 'Charlie Crew',
    members: [employees[6], employees[7], employees[9]],
    specialties: ['mowing', 'spring-cleanup', 'fall-cleanup', 'snow-removal', 'leaf-removal'],
    equipment: [equipment[1], equipment[5], equipment[9]],
    status: 'available',
    serviceZone: 'Canton / North Canton',
    todayJobsCount: 9,
    todayJobsCompleted: 5,
    efficiency: 85,
  },
];

// ============================================================
// Service Agreements (used within properties)
// ============================================================

function sa(id: string, propertyId: string, serviceType: ServiceAgreement['serviceType'], freq: ServiceAgreement['frequency'], dur: number, price: number, extra?: Partial<ServiceAgreement>): ServiceAgreement {
  return {
    id,
    propertyId,
    serviceType,
    frequency: freq,
    estimatedDuration: dur,
    price,
    seasonStart: '2026-04-01',
    seasonEnd: '2026-11-15',
    status: 'active',
    ...extra,
  };
}

// ============================================================
// Customers & Properties
// ============================================================

export const customers: Customer[] = [
  {
    id: 'cust-01', name: 'Robert & Linda Henderson', email: 'henderson.r@gmail.com', phone: '(330) 555-1001',
    address: '1482 Merriman Rd', city: 'Akron', state: 'OH', zip: '44313',
    status: 'active', notes: 'Long-time customer since 2019. Prefers early morning service.',
    preferredContact: 'phone', createdAt: '2019-03-15T00:00:00Z',
    properties: [{
      id: 'prop-01', customerId: 'cust-01', address: '1482 Merriman Rd, Akron, OH 44313',
      lotSize: 12000, features: ['garden beds', 'large backyard', 'sprinkler system'],
      accessInstructions: 'Side gate unlocked on service days',
      services: [
        sa('sa-01', 'prop-01', 'mowing', 'weekly', 45, 55),
        sa('sa-02', 'prop-01', 'fertilization', 'seasonal', 30, 65, { nextScheduledDate: daysFromNow(14) }),
      ],
    }],
  },
  {
    id: 'cust-02', name: 'Patricia Kowalski', email: 'pat.kowalski@yahoo.com', phone: '(330) 555-1002',
    address: '305 Wadsworth Ave', city: 'Wadsworth', state: 'OH', zip: '44281',
    status: 'active', notes: 'Wants text confirmation before each visit.',
    preferredContact: 'sms', createdAt: '2021-05-20T00:00:00Z',
    properties: [{
      id: 'prop-02', customerId: 'cust-02', address: '305 Wadsworth Ave, Wadsworth, OH 44281',
      lotSize: 8500, features: ['slope', 'fence', 'pool'],
      gateCode: '4821',
      services: [
        sa('sa-03', 'prop-02', 'mowing', 'weekly', 35, 45),
        sa('sa-04', 'prop-02', 'shrub-trimming', 'monthly', 60, 120),
      ],
    }],
  },
  {
    id: 'cust-03', name: 'James & Maria Chen', email: 'jchen@outlook.com', phone: '(330) 555-1003',
    address: '7720 Fulton Dr NW', city: 'Canton', state: 'OH', zip: '44718',
    status: 'active', notes: 'Premium customer. Snow removal contract. Always wants same crew.',
    preferredContact: 'email', createdAt: '2020-01-10T00:00:00Z',
    properties: [{
      id: 'prop-03', customerId: 'cust-03', address: '7720 Fulton Dr NW, Canton, OH 44718',
      lotSize: 18000, features: ['large lot', 'circular drive', 'garden beds', 'gate'],
      gateCode: '1234',
      accessInstructions: 'Use keypad at front gate. Dogs are friendly.',
      services: [
        sa('sa-05', 'prop-03', 'mowing', 'weekly', 60, 85),
        sa('sa-06', 'prop-03', 'landscaping', 'bi-weekly', 120, 250),
        sa('sa-07', 'prop-03', 'snow-removal', 'snow-event', 45, 150, { seasonStart: '2026-11-01', seasonEnd: '2027-03-31', status: 'paused' }),
      ],
    }],
  },
  {
    id: 'cust-04', name: 'Angela Thompson', email: 'athompson44@gmail.com', phone: '(330) 555-1004',
    address: '189 N Court St', city: 'Medina', state: 'OH', zip: '44256',
    status: 'active', notes: 'Prefers afternoon service. Has elderly mother living with her.',
    preferredContact: 'phone', createdAt: '2022-04-18T00:00:00Z',
    properties: [{
      id: 'prop-04', customerId: 'cust-04', address: '189 N Court St, Medina, OH 44256',
      lotSize: 6500, features: ['corner lot', 'flower beds'],
      services: [
        sa('sa-08', 'prop-04', 'mowing', 'weekly', 30, 40),
        sa('sa-09', 'prop-04', 'bed-maintenance', 'bi-weekly', 45, 75),
      ],
    }],
  },
  {
    id: 'cust-05', name: 'David & Susan Wright', email: 'dwright@gmail.com', phone: '(330) 555-1005',
    address: '4501 Everett Rd', city: 'Richfield', state: 'OH', zip: '44286',
    status: 'active', notes: 'Large estate property. Requires full-service.',
    preferredContact: 'email', createdAt: '2020-06-01T00:00:00Z',
    properties: [{
      id: 'prop-05', customerId: 'cust-05', address: '4501 Everett Rd, Richfield, OH 44286',
      lotSize: 43560, features: ['acre lot', 'wooded border', 'pond', 'long driveway'],
      accessInstructions: 'Enter via service road on east side of property.',
      services: [
        sa('sa-10', 'prop-05', 'mowing', 'weekly', 90, 175),
        sa('sa-11', 'prop-05', 'landscaping', 'monthly', 180, 450),
        sa('sa-12', 'prop-05', 'spring-cleanup', 'seasonal', 240, 600, { nextScheduledDate: daysFromNow(2) }),
      ],
    }],
  },
  {
    id: 'cust-06', name: 'Michael O\'Brien', email: 'mobrien@hotmail.com', phone: '(330) 555-1006',
    address: '902 W Liberty St', city: 'Wooster', state: 'OH', zip: '44691',
    status: 'active', notes: 'Bi-weekly mowing only. Budget conscious.',
    preferredContact: 'sms', createdAt: '2023-03-25T00:00:00Z',
    properties: [{
      id: 'prop-06', customerId: 'cust-06', address: '902 W Liberty St, Wooster, OH 44691',
      lotSize: 7200, features: ['fence', 'shed'],
      services: [
        sa('sa-13', 'prop-06', 'mowing', 'bi-weekly', 30, 40),
      ],
    }],
  },
  {
    id: 'cust-07', name: 'Karen & Steve Patel', email: 'kpatel@yahoo.com', phone: '(330) 555-1007',
    address: '2210 S Arlington Rd', city: 'Akron', state: 'OH', zip: '44319',
    status: 'active', notes: 'New construction property. Lawn is establishing.',
    preferredContact: 'email', createdAt: '2024-09-10T00:00:00Z',
    properties: [{
      id: 'prop-07', customerId: 'cust-07', address: '2210 S Arlington Rd, Akron, OH 44319',
      lotSize: 9800, features: ['new lawn', 'irrigation system', 'decorative stone'],
      services: [
        sa('sa-14', 'prop-07', 'mowing', 'weekly', 40, 50),
        sa('sa-15', 'prop-07', 'fertilization', 'monthly', 30, 55),
      ],
    }],
  },
  {
    id: 'cust-08', name: 'Dorothy Fischer', email: 'dfischer@gmail.com', phone: '(330) 555-1008',
    address: '785 Park Ave W', city: 'Mansfield', state: 'OH', zip: '44906',
    status: 'active', notes: 'Senior customer. Son manages the account. Very particular about edging.',
    preferredContact: 'phone', createdAt: '2018-05-12T00:00:00Z',
    properties: [{
      id: 'prop-08', customerId: 'cust-08', address: '785 Park Ave W, Mansfield, OH 44906',
      lotSize: 5800, features: ['corner lot', 'mature trees'],
      services: [
        sa('sa-16', 'prop-08', 'mowing', 'weekly', 30, 40),
      ],
    }],
  },
  {
    id: 'cust-09', name: 'Valley View Church', email: 'office@valleyviewchurch.org', phone: '(330) 555-1009',
    address: '3000 N Main St', city: 'North Canton', state: 'OH', zip: '44720',
    status: 'active', notes: 'Commercial account. Must be done before Sunday services.',
    preferredContact: 'email', createdAt: '2021-02-01T00:00:00Z',
    properties: [{
      id: 'prop-09', customerId: 'cust-09', address: '3000 N Main St, North Canton, OH 44720',
      lotSize: 32000, features: ['commercial', 'parking lot islands', 'sign beds'],
      accessInstructions: 'Use back entrance. Avoid blocking parking lot on Sundays.',
      services: [
        sa('sa-17', 'prop-09', 'mowing', 'weekly', 75, 125),
        sa('sa-18', 'prop-09', 'mulching', 'seasonal', 120, 350, { nextScheduledDate: daysFromNow(5) }),
        sa('sa-19', 'prop-09', 'bed-maintenance', 'monthly', 60, 95),
      ],
    }],
  },
  {
    id: 'cust-10', name: 'Greg & Tammy Novak', email: 'novak.greg@gmail.com', phone: '(330) 555-1010',
    address: '461 Granger Rd', city: 'Medina', state: 'OH', zip: '44256',
    status: 'active', notes: 'Referred by Henderson. Just added landscaping service.',
    preferredContact: 'sms', createdAt: '2025-11-01T00:00:00Z',
    properties: [{
      id: 'prop-10', customerId: 'cust-10', address: '461 Granger Rd, Medina, OH 44256',
      lotSize: 11000, features: ['garden beds', 'patio', 'retaining wall'],
      services: [
        sa('sa-20', 'prop-10', 'mowing', 'weekly', 40, 50),
        sa('sa-21', 'prop-10', 'landscaping', 'one-time', 480, 2200, { nextScheduledDate: daysFromNow(3) }),
      ],
    }],
  },
  {
    id: 'cust-11', name: 'Sunrise Senior Living', email: 'facilities@sunrisesenior.com', phone: '(330) 555-1011',
    address: '1500 W Market St', city: 'Akron', state: 'OH', zip: '44313',
    status: 'active', notes: 'Commercial account. Weekly mowing + seasonal bed work. Must maintain professional appearance.',
    preferredContact: 'email', createdAt: '2022-01-15T00:00:00Z',
    properties: [{
      id: 'prop-11', customerId: 'cust-11', address: '1500 W Market St, Akron, OH 44313',
      lotSize: 28000, features: ['commercial', 'flower beds', 'walkways', 'entrance beds'],
      services: [
        sa('sa-22', 'prop-11', 'mowing', 'weekly', 60, 110),
        sa('sa-23', 'prop-11', 'bed-maintenance', 'bi-weekly', 90, 185),
      ],
    }],
  },
  {
    id: 'cust-12', name: 'Rachel Adams', email: 'radams@icloud.com', phone: '(330) 555-1012',
    address: '224 Portage Trail', city: 'Cuyahoga Falls', state: 'OH', zip: '44221',
    status: 'prospect', notes: 'Requested quote for weekly mowing and mulching. Follow up by Friday.',
    preferredContact: 'email', createdAt: '2026-06-10T00:00:00Z',
    properties: [{
      id: 'prop-12', customerId: 'cust-12', address: '224 Portage Trail, Cuyahoga Falls, OH 44221',
      lotSize: 8000, features: ['hill', 'garden beds'],
      services: [],
    }],
  },
  {
    id: 'cust-13', name: 'Tom & Beth Harrington', email: 'tharrington@gmail.com', phone: '(330) 555-1013',
    address: '8812 Cleveland Ave NW', city: 'North Canton', state: 'OH', zip: '44720',
    status: 'active', notes: 'Snow removal priority. Has 3-car wide driveway.',
    preferredContact: 'phone', createdAt: '2020-10-20T00:00:00Z',
    properties: [{
      id: 'prop-13', customerId: 'cust-13', address: '8812 Cleveland Ave NW, North Canton, OH 44720',
      lotSize: 14000, features: ['large driveway', 'hedge row', 'pool'],
      gateCode: '7756',
      services: [
        sa('sa-24', 'prop-13', 'mowing', 'weekly', 50, 65),
        sa('sa-25', 'prop-13', 'shrub-trimming', 'monthly', 45, 90),
        sa('sa-26', 'prop-13', 'snow-removal', 'snow-event', 30, 125, { seasonStart: '2026-11-01', seasonEnd: '2027-03-31', status: 'paused' }),
      ],
    }],
  },
  {
    id: 'cust-14', name: 'Lisa Drummond', email: 'lisadrum@gmail.com', phone: '(234) 555-1014',
    address: '611 Smith Rd', city: 'Barberton', state: 'OH', zip: '44203',
    status: 'inactive', notes: 'Moved out of state. Account closed May 2026.',
    preferredContact: 'email', createdAt: '2021-07-01T00:00:00Z',
    properties: [{
      id: 'prop-14', customerId: 'cust-14', address: '611 Smith Rd, Barberton, OH 44203',
      lotSize: 6000, features: ['small lot'],
      services: [
        sa('sa-27', 'prop-14', 'mowing', 'weekly', 25, 35, { status: 'cancelled' }),
      ],
    }],
  },
  {
    id: 'cust-15', name: 'Eastwood Business Park', email: 'mgr@eastwoodbp.com', phone: '(330) 555-1015',
    address: '3600 Embassy Pkwy', city: 'Akron', state: 'OH', zip: '44333',
    status: 'active', notes: 'HOA-managed commercial park. 6 buildings. Invoice monthly.',
    preferredContact: 'email', createdAt: '2023-04-01T00:00:00Z',
    properties: [{
      id: 'prop-15', customerId: 'cust-15', address: '3600 Embassy Pkwy, Akron, OH 44333',
      lotSize: 65000, features: ['commercial', 'parking islands', 'entrance monuments', 'retention pond'],
      services: [
        sa('sa-28', 'prop-15', 'mowing', 'weekly', 120, 275),
        sa('sa-29', 'prop-15', 'mulching', 'seasonal', 360, 1800, { nextScheduledDate: daysFromNow(7) }),
        sa('sa-30', 'prop-15', 'bed-maintenance', 'bi-weekly', 90, 165),
      ],
    }],
  },
];

// ============================================================
// Jobs - Today (24 jobs spread across 3 crews)
// ============================================================

export const todayJobs: Job[] = [
  // --- Alpha Crew (8 jobs) ---
  { id: 'job-001', serviceAgreementId: 'sa-01', customerId: 'cust-01', customerName: 'Robert & Linda Henderson', propertyAddress: '1482 Merriman Rd, Akron', serviceType: 'mowing', scheduledDate: TODAY, startTime: '07:30', endTime: '08:15', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'completed', priority: 'normal', completedAt: `${TODAY}T08:10:00`, actualDuration: 40, weatherAffected: false },
  { id: 'job-002', serviceAgreementId: 'sa-14', customerId: 'cust-07', customerName: 'Karen & Steve Patel', propertyAddress: '2210 S Arlington Rd, Akron', serviceType: 'mowing', scheduledDate: TODAY, startTime: '08:30', endTime: '09:10', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'completed', priority: 'normal', completedAt: `${TODAY}T09:05:00`, actualDuration: 35, weatherAffected: false },
  { id: 'job-003', serviceAgreementId: 'sa-22', customerId: 'cust-11', customerName: 'Sunrise Senior Living', propertyAddress: '1500 W Market St, Akron', serviceType: 'mowing', scheduledDate: TODAY, startTime: '09:30', endTime: '10:30', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'completed', priority: 'committed', completedAt: `${TODAY}T10:25:00`, actualDuration: 55, weatherAffected: false },
  { id: 'job-004', serviceAgreementId: 'sa-28', customerId: 'cust-15', customerName: 'Eastwood Business Park', propertyAddress: '3600 Embassy Pkwy, Akron', serviceType: 'mowing', scheduledDate: TODAY, startTime: '10:45', endTime: '12:45', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'completed', priority: 'committed', completedAt: `${TODAY}T12:40:00`, actualDuration: 115, weatherAffected: false },
  { id: 'job-005', serviceAgreementId: 'sa-15', customerId: 'cust-07', customerName: 'Karen & Steve Patel', propertyAddress: '2210 S Arlington Rd, Akron', serviceType: 'fertilization', scheduledDate: TODAY, startTime: '13:15', endTime: '13:45', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'in-progress', priority: 'normal', weatherAffected: false },
  { id: 'job-006', serviceAgreementId: 'sa-02', customerId: 'cust-01', customerName: 'Robert & Linda Henderson', propertyAddress: '1482 Merriman Rd, Akron', serviceType: 'fertilization', scheduledDate: TODAY, startTime: '14:00', endTime: '14:30', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-007', serviceAgreementId: 'sa-23', customerId: 'cust-11', customerName: 'Sunrise Senior Living', propertyAddress: '1500 W Market St, Akron', serviceType: 'bed-maintenance', scheduledDate: TODAY, startTime: '14:45', endTime: '16:15', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-008', serviceAgreementId: 'sa-30', customerId: 'cust-15', customerName: 'Eastwood Business Park', propertyAddress: '3600 Embassy Pkwy, Akron', serviceType: 'bed-maintenance', scheduledDate: TODAY, startTime: '16:30', endTime: '18:00', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },

  // --- Bravo Crew (7 jobs) ---
  { id: 'job-009', serviceAgreementId: 'sa-03', customerId: 'cust-02', customerName: 'Patricia Kowalski', propertyAddress: '305 Wadsworth Ave, Wadsworth', serviceType: 'mowing', scheduledDate: TODAY, startTime: '07:30', endTime: '08:05', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'completed', priority: 'normal', completedAt: `${TODAY}T08:00:00`, actualDuration: 30, weatherAffected: false },
  { id: 'job-010', serviceAgreementId: 'sa-08', customerId: 'cust-04', customerName: 'Angela Thompson', propertyAddress: '189 N Court St, Medina', serviceType: 'mowing', scheduledDate: TODAY, startTime: '08:30', endTime: '09:00', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'completed', priority: 'normal', completedAt: `${TODAY}T08:55:00`, actualDuration: 25, weatherAffected: false },
  { id: 'job-011', serviceAgreementId: 'sa-09', customerId: 'cust-04', customerName: 'Angela Thompson', propertyAddress: '189 N Court St, Medina', serviceType: 'bed-maintenance', scheduledDate: TODAY, startTime: '09:00', endTime: '09:45', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'completed', priority: 'normal', completedAt: `${TODAY}T09:50:00`, actualDuration: 50, weatherAffected: false },
  { id: 'job-012', serviceAgreementId: 'sa-20', customerId: 'cust-10', customerName: 'Greg & Tammy Novak', propertyAddress: '461 Granger Rd, Medina', serviceType: 'mowing', scheduledDate: TODAY, startTime: '10:15', endTime: '10:55', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'in-progress', priority: 'normal', weatherAffected: false },
  { id: 'job-013', serviceAgreementId: 'sa-04', customerId: 'cust-02', customerName: 'Patricia Kowalski', propertyAddress: '305 Wadsworth Ave, Wadsworth', serviceType: 'shrub-trimming', scheduledDate: TODAY, startTime: '11:15', endTime: '12:15', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-014', serviceAgreementId: 'sa-19', customerId: 'cust-09', customerName: 'Valley View Church', propertyAddress: '3000 N Main St, North Canton', serviceType: 'bed-maintenance', scheduledDate: TODAY, startTime: '13:00', endTime: '14:00', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'high', weatherAffected: false },
  { id: 'job-015', serviceAgreementId: 'sa-25', customerId: 'cust-13', customerName: 'Tom & Beth Harrington', propertyAddress: '8812 Cleveland Ave NW, North Canton', serviceType: 'shrub-trimming', scheduledDate: TODAY, startTime: '14:30', endTime: '15:15', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },

  // --- Charlie Crew (9 jobs) ---
  { id: 'job-016', serviceAgreementId: 'sa-05', customerId: 'cust-03', customerName: 'James & Maria Chen', propertyAddress: '7720 Fulton Dr NW, Canton', serviceType: 'mowing', scheduledDate: TODAY, startTime: '07:00', endTime: '08:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'completed', priority: 'committed', completedAt: `${TODAY}T07:55:00`, actualDuration: 55, weatherAffected: false },
  { id: 'job-017', serviceAgreementId: 'sa-17', customerId: 'cust-09', customerName: 'Valley View Church', propertyAddress: '3000 N Main St, North Canton', serviceType: 'mowing', scheduledDate: TODAY, startTime: '08:15', endTime: '09:30', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'completed', priority: 'committed', completedAt: `${TODAY}T09:25:00`, actualDuration: 70, weatherAffected: false },
  { id: 'job-018', serviceAgreementId: 'sa-24', customerId: 'cust-13', customerName: 'Tom & Beth Harrington', propertyAddress: '8812 Cleveland Ave NW, North Canton', serviceType: 'mowing', scheduledDate: TODAY, startTime: '09:45', endTime: '10:35', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'completed', priority: 'normal', completedAt: `${TODAY}T10:30:00`, actualDuration: 45, weatherAffected: false },
  { id: 'job-019', serviceAgreementId: 'sa-06', customerId: 'cust-03', customerName: 'James & Maria Chen', propertyAddress: '7720 Fulton Dr NW, Canton', serviceType: 'landscaping', scheduledDate: TODAY, startTime: '10:45', endTime: '12:45', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'completed', priority: 'high', completedAt: `${TODAY}T12:50:00`, actualDuration: 125, weatherAffected: false },
  { id: 'job-020', serviceAgreementId: 'sa-16', customerId: 'cust-08', customerName: 'Dorothy Fischer', propertyAddress: '785 Park Ave W, Mansfield', serviceType: 'mowing', scheduledDate: TODAY, startTime: '13:30', endTime: '14:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'completed', priority: 'normal', completedAt: `${TODAY}T13:58:00`, actualDuration: 28, weatherAffected: false },
  { id: 'job-021', serviceAgreementId: 'sa-13', customerId: 'cust-06', customerName: "Michael O'Brien", propertyAddress: '902 W Liberty St, Wooster', serviceType: 'mowing', scheduledDate: TODAY, startTime: '14:30', endTime: '15:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-022', serviceAgreementId: 'sa-10', customerId: 'cust-05', customerName: 'David & Susan Wright', propertyAddress: '4501 Everett Rd, Richfield', serviceType: 'mowing', scheduledDate: TODAY, startTime: '15:30', endTime: '17:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'high', weatherAffected: false },
  { id: 'job-023', serviceAgreementId: 'sa-11', customerId: 'cust-05', customerName: 'David & Susan Wright', propertyAddress: '4501 Everett Rd, Richfield', serviceType: 'landscaping', scheduledDate: TODAY, startTime: '15:30', endTime: '17:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'weather-delayed', priority: 'normal', notes: 'Postponed due to afternoon storm risk. Rescheduled to Thursday.', weatherAffected: true },
  { id: 'job-024', serviceAgreementId: 'sa-12', customerId: 'cust-05', customerName: 'David & Susan Wright', propertyAddress: '4501 Everett Rd, Richfield', serviceType: 'spring-cleanup', scheduledDate: TODAY, startTime: '17:00', endTime: '18:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'cancelled', priority: 'normal', notes: 'Customer rescheduled to next week.', weatherAffected: false },
];

// ============================================================
// Jobs - Rest of the week (for schedule view)
// ============================================================

export const weekJobs: Job[] = [
  // Tomorrow
  { id: 'job-101', serviceAgreementId: 'sa-01', customerId: 'cust-01', customerName: 'Robert & Linda Henderson', propertyAddress: '1482 Merriman Rd, Akron', serviceType: 'mowing', scheduledDate: daysFromNow(1), startTime: '07:30', endTime: '08:15', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-102', serviceAgreementId: 'sa-14', customerId: 'cust-07', customerName: 'Karen & Steve Patel', propertyAddress: '2210 S Arlington Rd, Akron', serviceType: 'mowing', scheduledDate: daysFromNow(1), startTime: '08:30', endTime: '09:10', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-103', serviceAgreementId: 'sa-22', customerId: 'cust-11', customerName: 'Sunrise Senior Living', propertyAddress: '1500 W Market St, Akron', serviceType: 'mowing', scheduledDate: daysFromNow(1), startTime: '09:30', endTime: '10:30', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'committed', weatherAffected: false },
  { id: 'job-104', serviceAgreementId: 'sa-03', customerId: 'cust-02', customerName: 'Patricia Kowalski', propertyAddress: '305 Wadsworth Ave, Wadsworth', serviceType: 'mowing', scheduledDate: daysFromNow(1), startTime: '07:30', endTime: '08:05', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-105', serviceAgreementId: 'sa-08', customerId: 'cust-04', customerName: 'Angela Thompson', propertyAddress: '189 N Court St, Medina', serviceType: 'mowing', scheduledDate: daysFromNow(1), startTime: '08:30', endTime: '09:00', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-106', serviceAgreementId: 'sa-05', customerId: 'cust-03', customerName: 'James & Maria Chen', propertyAddress: '7720 Fulton Dr NW, Canton', serviceType: 'mowing', scheduledDate: daysFromNow(1), startTime: '07:00', endTime: '08:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'committed', weatherAffected: false },
  { id: 'job-107', serviceAgreementId: 'sa-17', customerId: 'cust-09', customerName: 'Valley View Church', propertyAddress: '3000 N Main St, North Canton', serviceType: 'mowing', scheduledDate: daysFromNow(1), startTime: '08:15', endTime: '09:30', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'committed', weatherAffected: false },

  // Day after tomorrow
  { id: 'job-201', serviceAgreementId: 'sa-28', customerId: 'cust-15', customerName: 'Eastwood Business Park', propertyAddress: '3600 Embassy Pkwy, Akron', serviceType: 'mowing', scheduledDate: daysFromNow(2), startTime: '07:00', endTime: '09:00', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'committed', weatherAffected: false },
  { id: 'job-202', serviceAgreementId: 'sa-12', customerId: 'cust-05', customerName: 'David & Susan Wright', propertyAddress: '4501 Everett Rd, Richfield', serviceType: 'spring-cleanup', scheduledDate: daysFromNow(2), startTime: '09:30', endTime: '13:30', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'high', weatherAffected: false },
  { id: 'job-203', serviceAgreementId: 'sa-20', customerId: 'cust-10', customerName: 'Greg & Tammy Novak', propertyAddress: '461 Granger Rd, Medina', serviceType: 'mowing', scheduledDate: daysFromNow(2), startTime: '07:30', endTime: '08:10', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-204', serviceAgreementId: 'sa-21', customerId: 'cust-10', customerName: 'Greg & Tammy Novak', propertyAddress: '461 Granger Rd, Medina', serviceType: 'landscaping', scheduledDate: daysFromNow(2), startTime: '08:30', endTime: '16:30', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'high', notes: 'Full landscape installation - patio pavers, retaining wall repair, new plantings.', weatherAffected: false },
  { id: 'job-205', serviceAgreementId: 'sa-24', customerId: 'cust-13', customerName: 'Tom & Beth Harrington', propertyAddress: '8812 Cleveland Ave NW, North Canton', serviceType: 'mowing', scheduledDate: daysFromNow(2), startTime: '07:00', endTime: '07:50', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-206', serviceAgreementId: 'sa-16', customerId: 'cust-08', customerName: 'Dorothy Fischer', propertyAddress: '785 Park Ave W, Mansfield', serviceType: 'mowing', scheduledDate: daysFromNow(2), startTime: '09:00', endTime: '09:30', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },

  // +3 days (Thursday)
  { id: 'job-301', serviceAgreementId: 'sa-01', customerId: 'cust-01', customerName: 'Robert & Linda Henderson', propertyAddress: '1482 Merriman Rd, Akron', serviceType: 'mowing', scheduledDate: daysFromNow(3), startTime: '07:30', endTime: '08:15', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-302', serviceAgreementId: 'sa-11', customerId: 'cust-05', customerName: 'David & Susan Wright', propertyAddress: '4501 Everett Rd, Richfield', serviceType: 'landscaping', scheduledDate: daysFromNow(3), startTime: '09:00', endTime: '15:00', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'high', notes: 'Rescheduled from weather delay.', weatherAffected: false },
  { id: 'job-303', serviceAgreementId: 'sa-03', customerId: 'cust-02', customerName: 'Patricia Kowalski', propertyAddress: '305 Wadsworth Ave, Wadsworth', serviceType: 'mowing', scheduledDate: daysFromNow(3), startTime: '07:30', endTime: '08:05', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-304', serviceAgreementId: 'sa-05', customerId: 'cust-03', customerName: 'James & Maria Chen', propertyAddress: '7720 Fulton Dr NW, Canton', serviceType: 'mowing', scheduledDate: daysFromNow(3), startTime: '07:00', endTime: '08:00', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'committed', weatherAffected: false },

  // +4 days (Friday)
  { id: 'job-401', serviceAgreementId: 'sa-22', customerId: 'cust-11', customerName: 'Sunrise Senior Living', propertyAddress: '1500 W Market St, Akron', serviceType: 'mowing', scheduledDate: daysFromNow(4), startTime: '07:00', endTime: '08:00', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'committed', weatherAffected: false },
  { id: 'job-402', serviceAgreementId: 'sa-28', customerId: 'cust-15', customerName: 'Eastwood Business Park', propertyAddress: '3600 Embassy Pkwy, Akron', serviceType: 'mowing', scheduledDate: daysFromNow(4), startTime: '08:30', endTime: '10:30', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'committed', weatherAffected: false },
  { id: 'job-403', serviceAgreementId: 'sa-08', customerId: 'cust-04', customerName: 'Angela Thompson', propertyAddress: '189 N Court St, Medina', serviceType: 'mowing', scheduledDate: daysFromNow(4), startTime: '07:30', endTime: '08:00', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },
  { id: 'job-404', serviceAgreementId: 'sa-17', customerId: 'cust-09', customerName: 'Valley View Church', propertyAddress: '3000 N Main St, North Canton', serviceType: 'mowing', scheduledDate: daysFromNow(4), startTime: '07:00', endTime: '08:15', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'committed', notes: 'Must complete before 10am - event at church.', weatherAffected: false },
  { id: 'job-405', serviceAgreementId: 'sa-13', customerId: 'cust-06', customerName: "Michael O'Brien", propertyAddress: '902 W Liberty St, Wooster', serviceType: 'mowing', scheduledDate: daysFromNow(4), startTime: '09:00', endTime: '09:30', crewId: 'crew-charlie', crewName: 'Charlie Crew', status: 'scheduled', priority: 'normal', weatherAffected: false },

  // +5 days (Saturday - light schedule)
  { id: 'job-501', serviceAgreementId: 'sa-10', customerId: 'cust-05', customerName: 'David & Susan Wright', propertyAddress: '4501 Everett Rd, Richfield', serviceType: 'mowing', scheduledDate: daysFromNow(5), startTime: '07:00', endTime: '08:30', crewId: 'crew-alpha', crewName: 'Alpha Crew', status: 'scheduled', priority: 'high', weatherAffected: false },
  { id: 'job-502', serviceAgreementId: 'sa-18', customerId: 'cust-09', customerName: 'Valley View Church', propertyAddress: '3000 N Main St, North Canton', serviceType: 'mulching', scheduledDate: daysFromNow(5), startTime: '07:00', endTime: '09:00', crewId: 'crew-bravo', crewName: 'Bravo Crew', status: 'scheduled', priority: 'high', notes: 'Seasonal mulching - entrance beds and sign area.', weatherAffected: false },
];

/** All jobs combined for easy access */
export const allJobs: Job[] = [...todayJobs, ...weekJobs];

// ============================================================
// Weather Data (Northeast Ohio, mid-June)
// ============================================================

export const weatherData: WeatherData = {
  current: {
    temp: 78,
    feelsLike: 81,
    condition: 'cloudy',
    humidity: 62,
    windSpeed: 8,
    icon: 'CloudSun',
  },
  forecast: [
    { date: TODAY, high: 82, low: 64, condition: 'Partly Cloudy', precipChance: 20, impact: 'none' },
    { date: daysFromNow(1), high: 85, low: 66, condition: 'Sunny', precipChance: 5, impact: 'none' },
    { date: daysFromNow(2), high: 79, low: 63, condition: 'Scattered Showers', precipChance: 55, impact: 'moderate' },
    { date: daysFromNow(3), high: 76, low: 60, condition: 'AM Showers', precipChance: 40, impact: 'low' },
    { date: daysFromNow(4), high: 83, low: 65, condition: 'Sunny', precipChance: 10, impact: 'none' },
    { date: daysFromNow(5), high: 86, low: 68, condition: 'Hot & Humid', precipChance: 15, impact: 'low' },
    { date: daysFromNow(6), high: 88, low: 70, condition: 'PM Thunderstorms', precipChance: 65, impact: 'high' },
  ],
  alerts: [
    {
      id: 'alert-01',
      type: 'storm',
      severity: 'watch',
      title: 'Thunderstorm Watch',
      description: 'Scattered thunderstorms possible Wednesday afternoon and evening. Some storms could produce gusty winds and heavy rain.',
      startTime: `${daysFromNow(2)}T14:00:00`,
      endTime: `${daysFromNow(2)}T22:00:00`,
      affectedJobs: 3,
    },
    {
      id: 'alert-02',
      type: 'heat',
      severity: 'advisory',
      title: 'Heat Advisory',
      description: 'Heat index values up to 95 expected Sunday. Ensure crews stay hydrated and take frequent breaks.',
      startTime: `${daysFromNow(6)}T11:00:00`,
      endTime: `${daysFromNow(6)}T19:00:00`,
      affectedJobs: 0,
    },
  ],
};

// ============================================================
// Notifications (recent 18)
// ============================================================

export const notifications: Notification[] = [
  { id: 'notif-01', customerId: 'cust-01', customerName: 'Robert & Linda Henderson', type: 'completion', channel: 'sms', message: 'Your lawn service has been completed today. Thank you for choosing Orange Blossom Special!', status: 'delivered', sentAt: minutesAgo(45) },
  { id: 'notif-02', customerId: 'cust-07', customerName: 'Karen & Steve Patel', type: 'completion', channel: 'email', message: 'Service completed at 2210 S Arlington Rd. Your fertilization treatment is scheduled for this afternoon.', status: 'delivered', sentAt: minutesAgo(90) },
  { id: 'notif-03', customerId: 'cust-11', customerName: 'Sunrise Senior Living', type: 'completion', channel: 'email', message: 'Weekly mowing service completed at your facility. Bed maintenance scheduled for this afternoon.', status: 'read', sentAt: hoursAgo(2) },
  { id: 'notif-04', customerId: 'cust-02', customerName: 'Patricia Kowalski', type: 'reminder', channel: 'sms', message: 'Reminder: Your shrub trimming service is scheduled for today between 11:15 AM - 12:15 PM.', status: 'delivered', sentAt: hoursAgo(4) },
  { id: 'notif-05', customerId: 'cust-05', customerName: 'David & Susan Wright', type: 'weather', channel: 'email', message: 'Due to potential storms Wednesday, your landscaping service has been rescheduled to Thursday. We apologize for the inconvenience.', status: 'delivered', sentAt: hoursAgo(3) },
  { id: 'notif-06', customerId: 'cust-03', customerName: 'James & Maria Chen', type: 'committed-window', channel: 'sms', message: 'Your committed service window is confirmed: Mowing tomorrow 7:00 AM - 8:00 AM.', status: 'sent', sentAt: hoursAgo(1) },
  { id: 'notif-07', customerId: 'cust-09', customerName: 'Valley View Church', type: 'schedule', channel: 'email', message: 'Your seasonal mulching is scheduled for Saturday, June 20. Estimated time: 7:00 AM - 9:00 AM.', status: 'delivered', sentAt: hoursAgo(5) },
  { id: 'notif-08', customerId: 'cust-04', customerName: 'Angela Thompson', type: 'completion', channel: 'sms', message: 'Service completed at 189 N Court St. Both mowing and bed maintenance done. See you in two weeks!', status: 'delivered', sentAt: hoursAgo(3) },
  { id: 'notif-09', customerId: 'cust-13', customerName: 'Tom & Beth Harrington', type: 'reminder', channel: 'sms', message: 'Reminder: Mowing service scheduled for today. Gate code confirmed. Shrub trimming also today.', status: 'read', sentAt: hoursAgo(6) },
  { id: 'notif-10', customerId: 'cust-15', customerName: 'Eastwood Business Park', type: 'completion', channel: 'email', message: 'Weekly grounds maintenance completed. Bed maintenance scheduled for this afternoon.', status: 'delivered', sentAt: hoursAgo(1) },
  { id: 'notif-11', customerId: 'cust-10', customerName: 'Greg & Tammy Novak', type: 'schedule', channel: 'sms', message: 'Your landscape installation is confirmed for Wednesday. Our Bravo Crew will arrive at 8:30 AM.', status: 'delivered', sentAt: hoursAgo(8) },
  { id: 'notif-12', customerId: 'cust-06', customerName: "Michael O'Brien", type: 'reminder', channel: 'sms', message: 'Bi-weekly mowing service scheduled for today around 2:30 PM.', status: 'sent', sentAt: hoursAgo(5) },
  { id: 'notif-13', customerId: 'cust-08', customerName: 'Dorothy Fischer', type: 'completion', channel: 'sms', message: 'Called to confirm service completion. Spoke with son - all looks good.', status: 'delivered', sentAt: hoursAgo(2) },
  { id: 'notif-14', customerId: 'cust-12', customerName: 'Rachel Adams', type: 'schedule', channel: 'email', message: 'Thank you for your interest! We have scheduled a property assessment for Friday at 4:00 PM.', status: 'delivered', sentAt: hoursAgo(24) },
  { id: 'notif-15', customerId: 'cust-05', customerName: 'David & Susan Wright', type: 'reschedule', channel: 'email', message: 'Your spring cleanup has been rescheduled per your request to next week. We will confirm the exact date.', status: 'read', sentAt: hoursAgo(4) },
  { id: 'notif-16', customerId: 'cust-01', customerName: 'Robert & Linda Henderson', type: 'reminder', channel: 'sms', message: 'Good morning! Your lawn service crew is on the way. Expected arrival: 7:30 AM.', status: 'delivered', sentAt: hoursAgo(7) },
  { id: 'notif-17', customerId: 'cust-03', customerName: 'James & Maria Chen', type: 'completion', channel: 'email', message: 'Today\'s mowing and landscaping services are complete. Your property looks fantastic!', status: 'pending', sentAt: minutesAgo(15) },
  { id: 'notif-18', customerId: 'cust-09', customerName: 'Valley View Church', type: 'committed-window', channel: 'email', message: 'Confirming your committed Friday service window: 7:00 AM - 8:15 AM mowing, must complete before 10 AM event.', status: 'sent', sentAt: hoursAgo(2) },
];

// ============================================================
// Activity Feed (last 48 hours)
// ============================================================

export const activities: Activity[] = [
  { id: 'act-01', type: 'job-completed', description: 'Alpha Crew completed mowing at Henderson - 1482 Merriman Rd', timestamp: minutesAgo(45), entityId: 'job-001', entityType: 'job' },
  { id: 'act-02', type: 'job-completed', description: 'Alpha Crew completed mowing at Patel - 2210 S Arlington Rd', timestamp: minutesAgo(90), entityId: 'job-002', entityType: 'job' },
  { id: 'act-03', type: 'job-completed', description: 'Bravo Crew completed bed maintenance at Thompson - 189 N Court St', timestamp: hoursAgo(3), entityId: 'job-011', entityType: 'job' },
  { id: 'act-04', type: 'message-sent', description: 'Weather reschedule notice sent to David & Susan Wright', timestamp: hoursAgo(3), entityId: 'notif-05', entityType: 'notification' },
  { id: 'act-05', type: 'crew-clockin', description: 'Marcus Johnson (Alpha Crew Lead) clocked in', timestamp: `${TODAY}T06:45:00`, entityId: 'emp-01', entityType: 'employee' },
  { id: 'act-06', type: 'crew-clockin', description: 'Sofia Martinez (Bravo Crew Lead) clocked in', timestamp: `${TODAY}T07:00:00`, entityId: 'emp-04', entityType: 'employee' },
  { id: 'act-07', type: 'crew-clockin', description: 'Caleb Foster (Charlie Crew Lead) clocked in', timestamp: `${TODAY}T06:40:00`, entityId: 'emp-07', entityType: 'employee' },
  { id: 'act-08', type: 'weather-alert', description: 'Thunderstorm Watch issued for Wednesday afternoon - 3 jobs may be affected', timestamp: hoursAgo(4), entityId: 'alert-01', entityType: 'weather' },
  { id: 'act-09', type: 'job-completed', description: 'Charlie Crew completed mowing at Chen - 7720 Fulton Dr NW', timestamp: hoursAgo(5), entityId: 'job-016', entityType: 'job' },
  { id: 'act-10', type: 'job-completed', description: 'Charlie Crew completed landscaping at Chen - 7720 Fulton Dr NW', timestamp: hoursAgo(1), entityId: 'job-019', entityType: 'job' },
  { id: 'act-11', type: 'payment-received', description: 'Payment received from Eastwood Business Park - $440 (June invoice)', timestamp: hoursAgo(6), entityId: 'cust-15', entityType: 'customer' },
  { id: 'act-12', type: 'message-sent', description: 'Schedule confirmation sent to Valley View Church for Saturday mulching', timestamp: hoursAgo(5), entityId: 'notif-07', entityType: 'notification' },
  { id: 'act-13', type: 'reschedule', description: 'Wright spring cleanup rescheduled to next week per customer request', timestamp: hoursAgo(4), entityId: 'job-024', entityType: 'job' },
  { id: 'act-14', type: 'customer-added', description: 'New prospect: Rachel Adams - 224 Portage Trail, Cuyahoga Falls', timestamp: hoursAgo(28), entityId: 'cust-12', entityType: 'customer' },
  { id: 'act-15', type: 'job-completed', description: 'Alpha Crew completed mowing at Sunrise Senior Living', timestamp: hoursAgo(2), entityId: 'job-003', entityType: 'job' },
  { id: 'act-16', type: 'job-completed', description: 'Alpha Crew completed mowing at Eastwood Business Park', timestamp: hoursAgo(1), entityId: 'job-004', entityType: 'job' },
  { id: 'act-17', type: 'payment-received', description: 'Payment received from James & Maria Chen - $335 (weekly services)', timestamp: hoursAgo(26), entityId: 'cust-03', entityType: 'customer' },
  { id: 'act-18', type: 'message-sent', description: 'Committed window confirmation sent to James & Maria Chen', timestamp: hoursAgo(1), entityId: 'notif-06', entityType: 'notification' },
  { id: 'act-19', type: 'job-completed', description: 'Bravo Crew completed mowing at Kowalski - 305 Wadsworth Ave', timestamp: hoursAgo(5), entityId: 'job-009', entityType: 'job' },
  { id: 'act-20', type: 'job-completed', description: 'Charlie Crew completed mowing at Harrington - 8812 Cleveland Ave NW', timestamp: hoursAgo(4), entityId: 'job-018', entityType: 'job' },
  { id: 'act-21', type: 'job-completed', description: 'Charlie Crew completed mowing at Fischer - 785 Park Ave W', timestamp: hoursAgo(1), entityId: 'job-020', entityType: 'job' },
  { id: 'act-22', type: 'crew-clockin', description: 'Tyler Reed (Alpha Technician) clocked in', timestamp: `${TODAY}T06:50:00`, entityId: 'emp-02', entityType: 'employee' },
  { id: 'act-23', type: 'payment-received', description: 'Payment received from Patricia Kowalski - $165 (monthly services)', timestamp: hoursAgo(30), entityId: 'cust-02', entityType: 'customer' },
  { id: 'act-24', type: 'message-sent', description: 'Service reminder sent to Tom & Beth Harrington', timestamp: hoursAgo(6), entityId: 'notif-09', entityType: 'notification' },
];

// ============================================================
// Daily Metrics (last 30 days)
// ============================================================

export const dailyMetrics: DailyMetrics[] = Array.from({ length: 30 }, (_, i) => {
  const daysBack = 29 - i;
  const date = format(subDays(new Date(), daysBack), 'yyyy-MM-dd');
  const dayOfWeek = subDays(new Date(), daysBack).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Base values with realistic variation
  const baseJobs = isWeekend ? 8 : 22;
  const jobVariance = Math.floor(Math.random() * 6) - 2;
  const jobsScheduled = Math.max(5, baseJobs + jobVariance);
  const completionRate = 0.85 + Math.random() * 0.13;
  const jobsCompleted = Math.round(jobsScheduled * completionRate);

  // Revenue correlates with completed jobs
  const avgRevenuePerJob = 75 + Math.random() * 40;
  const revenue = Math.round(jobsCompleted * avgRevenuePerJob);

  return {
    date,
    revenue,
    jobsCompleted,
    jobsScheduled,
    crewUtilization: Math.round(65 + Math.random() * 28),
    customerSatisfaction: Number((4.2 + Math.random() * 0.7).toFixed(1)),
  };
});

// ============================================================
// Dashboard Stats (computed summary)
// ============================================================

export const dashboardStats: DashboardStats = {
  todayJobs: todayJobs.length,
  todayCompleted: todayJobs.filter((j) => j.status === 'completed').length,
  activeCrews: crews.filter((c) => c.status !== 'off-duty').length,
  totalCrews: crews.length,
  weeklyRevenue: dailyMetrics.slice(-7).reduce((sum, d) => sum + d.revenue, 0),
  weeklyRevenueChange: 8.3, // percent increase vs last week
  activeCustomers: customers.filter((c) => c.status === 'active').length,
  weatherImpact: 'low',
  pendingNotifications: notifications.filter((n) => n.status === 'pending').length,
};
