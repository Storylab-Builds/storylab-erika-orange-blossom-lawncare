import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { ServiceType, Job } from '@/types';

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string to a human-readable date.
 * e.g. "Jun 15, 2026"
 */
export function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'MMM d, yyyy');
  } catch {
    return date;
  }
}

/**
 * Format a time string (HH:mm or ISO) to 12-hour format.
 * e.g. "8:00 AM"
 */
export function formatTime(time: string): string {
  try {
    // Handle HH:mm format
    if (/^\d{2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h = hours % 12 || 12;
      return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    // Handle ISO format
    return format(parseISO(time), 'h:mm a');
  } catch {
    return time;
  }
}

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Return a Tailwind color class for a given service type.
 */
export function getServiceColor(type: ServiceType): string {
  const colors: Record<ServiceType, string> = {
    mowing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    landscaping: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    mulching: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'snow-removal': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'spring-cleanup': 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
    'fall-cleanup': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    fertilization: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    'bed-maintenance': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    'shrub-trimming': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'leaf-removal': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}

/**
 * Return a Lucide icon name for a service type.
 */
export function getServiceIcon(type: ServiceType): string {
  const icons: Record<ServiceType, string> = {
    mowing: 'Scissors',
    landscaping: 'TreePine',
    mulching: 'Layers',
    'snow-removal': 'Snowflake',
    'spring-cleanup': 'Flower2',
    'fall-cleanup': 'Leaf',
    fertilization: 'Droplets',
    'bed-maintenance': 'Shovel',
    'shrub-trimming': 'Trees',
    'leaf-removal': 'Wind',
    emergency: 'AlertTriangle',
  };
  return icons[type] ?? 'Wrench';
}

/**
 * Return a Tailwind color class for a status string.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Job statuses
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'in-progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500',
    rescheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'weather-delayed': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    // Customer statuses
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500',
    prospect: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    // Crew statuses
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'on-job': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'off-duty': 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500',
    break: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    // Notification statuses
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    read: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    // Priority
    normal: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    committed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
}

/**
 * Return an appropriate Lucide icon name for a weather condition.
 */
export function getWeatherIcon(condition: string): string {
  const icons: Record<string, string> = {
    clear: 'Sun',
    cloudy: 'Cloud',
    rain: 'CloudRain',
    storm: 'CloudLightning',
    snow: 'Snowflake',
    fog: 'CloudFog',
    'partly-cloudy': 'CloudSun',
  };
  return icons[condition] ?? 'Cloud';
}

/**
 * Calculate a mock route efficiency score based on job spread.
 * Returns a percentage 0-100.
 */
export function calculateRouteEfficiency(jobs: Job[]): number {
  if (jobs.length === 0) return 0;
  if (jobs.length === 1) return 100;
  // Simple heuristic: more completed jobs = higher efficiency
  const completed = jobs.filter((j) => j.status === 'completed').length;
  const base = 70 + (completed / jobs.length) * 25;
  // Penalize for weather-delayed jobs
  const delayed = jobs.filter((j) => j.weatherAffected).length;
  return Math.round(Math.max(0, Math.min(100, base - delayed * 3)));
}

/**
 * Get initials from a full name.
 * e.g. "John Smith" -> "JS"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get a relative time string from a timestamp.
 * e.g. "2 hours ago"
 */
export function getRelativeTime(timestamp: string): string {
  try {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  } catch {
    return timestamp;
  }
}
