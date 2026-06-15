export const APP_NAME = 'OBS Lawncare';
export const APP_DESCRIPTION = 'Orange Blossom Special Lawncare - Intelligent Operations Platform';

export const SERVICE_TYPES = {
  'mowing': { label: 'Mowing', color: '#22C55E', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: 'Scissors' },
  'landscaping': { label: 'Landscaping', color: '#D97706', bgColor: 'bg-amber-100', textColor: 'text-amber-700', icon: 'Trees' },
  'mulching': { label: 'Mulching', color: '#92400E', bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: 'Layers' },
  'snow-removal': { label: 'Snow Removal', color: '#3B82F6', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: 'Snowflake' },
  'spring-cleanup': { label: 'Spring Clean-up', color: '#10B981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', icon: 'Sprout' },
  'fall-cleanup': { label: 'Fall Clean-up', color: '#F59E0B', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: 'Leaf' },
  'fertilization': { label: 'Fertilization', color: '#8B5CF6', bgColor: 'bg-violet-100', textColor: 'text-violet-700', icon: 'Beaker' },
  'bed-maintenance': { label: 'Bed Maintenance', color: '#EC4899', bgColor: 'bg-pink-100', textColor: 'text-pink-700', icon: 'Flower2' },
  'shrub-trimming': { label: 'Shrub Trimming', color: '#14B8A6', bgColor: 'bg-teal-100', textColor: 'text-teal-700', icon: 'TreePine' },
  'leaf-removal': { label: 'Leaf Removal', color: '#EAB308', bgColor: 'bg-lime-100', textColor: 'text-lime-700', icon: 'Wind' },
  'emergency': { label: 'Emergency', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: 'AlertTriangle' },
} as const;

export type ServiceTypeKey = keyof typeof SERVICE_TYPES;

export const JOB_STATUSES = {
  'scheduled': { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700' },
  'cancelled': { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' },
  'rescheduled': { label: 'Rescheduled', color: 'bg-orange-100 text-orange-700' },
  'weather-delayed': { label: 'Weather Delayed', color: 'bg-red-100 text-red-700' },
} as const;

export type JobStatusKey = keyof typeof JOB_STATUSES;

export const CREW_STATUSES = {
  'available': { label: 'Available', color: 'bg-green-100 text-green-700' },
  'on-job': { label: 'On Job', color: 'bg-blue-100 text-blue-700' },
  'off-duty': { label: 'Off Duty', color: 'bg-gray-100 text-gray-700' },
  'break': { label: 'On Break', color: 'bg-yellow-100 text-yellow-700' },
} as const;

export type CrewStatusKey = keyof typeof CREW_STATUSES;

export const WEATHER_THRESHOLDS = {
  rain: { cancelThreshold: 60, delayThreshold: 40 },
  snow: { cancelThreshold: 2, emergencyThreshold: 4 },
  wind: { cancelThreshold: 35, cautionThreshold: 25 },
  heat: { cautionThreshold: 95 },
} as const;

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/customers', label: 'Customers', icon: 'Users' },
  { path: '/schedule', label: 'Schedule', icon: 'Calendar' },
  { path: '/crews', label: 'Crews', icon: 'HardHat' },
  { path: '/field', label: 'Field Ops', icon: 'MapPin' },
  { path: '/weather', label: 'Weather', icon: 'CloudSun' },
  { path: '/reports', label: 'Reports', icon: 'BarChart3' },
  { path: '/communications', label: 'Messages', icon: 'MessageSquare' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const;
