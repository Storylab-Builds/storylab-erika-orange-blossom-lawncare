// ============================================================
// Orange Blossom Special Lawncare - Core Type Definitions
// ============================================================

// --- Service Types ---

export type ServiceType =
  | 'mowing'
  | 'landscaping'
  | 'mulching'
  | 'snow-removal'
  | 'spring-cleanup'
  | 'fall-cleanup'
  | 'fertilization'
  | 'bed-maintenance'
  | 'shrub-trimming'
  | 'leaf-removal'
  | 'emergency';

// --- Customer & Property ---

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: 'active' | 'inactive' | 'prospect';
  properties: Property[];
  notes: string;
  preferredContact: 'phone' | 'email' | 'sms';
  createdAt: string;
}

export interface Property {
  id: string;
  customerId: string;
  address: string;
  lotSize: number; // sq ft
  features: string[]; // e.g., 'slope', 'gate', 'pool', 'garden beds'
  gateCode?: string;
  accessInstructions?: string;
  services: ServiceAgreement[];
}

export interface ServiceAgreement {
  id: string;
  propertyId: string;
  serviceType: ServiceType;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'seasonal' | 'one-time' | 'snow-event';
  estimatedDuration: number; // minutes
  price: number;
  seasonStart?: string;
  seasonEnd?: string;
  specialInstructions?: string;
  status: 'active' | 'paused' | 'cancelled';
  nextScheduledDate?: string;
}

// --- Jobs & Scheduling ---

export interface Job {
  id: string;
  serviceAgreementId: string;
  customerId: string;
  customerName: string;
  propertyAddress: string;
  serviceType: ServiceType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  crewId: string;
  crewName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled' | 'weather-delayed';
  priority: 'normal' | 'high' | 'urgent' | 'committed';
  notes?: string;
  completedAt?: string;
  actualDuration?: number;
  weatherAffected: boolean;
}

// --- Crews & Employees ---

export interface Crew {
  id: string;
  name: string;
  members: Employee[];
  specialties: ServiceType[];
  equipment: Equipment[];
  status: 'available' | 'on-job' | 'off-duty' | 'break';
  serviceZone: string;
  todayJobsCount: number;
  todayJobsCompleted: number;
  efficiency: number; // percentage
}

export interface Employee {
  id: string;
  name: string;
  role: 'crew-lead' | 'technician' | 'driver';
  phone: string;
  clockedIn: boolean;
  clockInTime?: string;
  onBreak: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  type:
    | 'zero-turn-mower'
    | 'stand-on-mower'
    | 'dump-trailer'
    | 'skid-steer'
    | 'snow-plow'
    | 'leaf-blower'
    | 'edger'
    | 'trimmer';
  status: 'available' | 'in-use' | 'maintenance';
}

// --- Weather ---

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    condition: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: DayForecast[];
  alerts: WeatherAlert[];
}

export interface DayForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipChance: number;
  impact: 'none' | 'low' | 'moderate' | 'high' | 'severe';
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'storm' | 'snow' | 'heat' | 'freeze';
  severity: 'watch' | 'warning' | 'advisory';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedJobs: number;
}

// --- Communications ---

export interface Notification {
  id: string;
  customerId: string;
  customerName: string;
  type: 'schedule' | 'reminder' | 'completion' | 'weather' | 'committed-window' | 'reschedule';
  channel: 'sms' | 'email' | 'push';
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
}

// --- Activity Feed ---

export interface Activity {
  id: string;
  type:
    | 'job-completed'
    | 'customer-added'
    | 'weather-alert'
    | 'reschedule'
    | 'crew-clockin'
    | 'message-sent'
    | 'payment-received';
  description: string;
  timestamp: string;
  entityId?: string;
  entityType?: string;
}

// --- Reports ---

export interface DailyMetrics {
  date: string;
  revenue: number;
  jobsCompleted: number;
  jobsScheduled: number;
  crewUtilization: number;
  customerSatisfaction: number;
}

// --- Dashboard Summary ---

export interface DashboardStats {
  todayJobs: number;
  todayCompleted: number;
  activeCrews: number;
  totalCrews: number;
  weeklyRevenue: number;
  weeklyRevenueChange: number;
  activeCustomers: number;
  weatherImpact: 'none' | 'low' | 'moderate' | 'high';
  pendingNotifications: number;
}
