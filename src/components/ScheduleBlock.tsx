import { clsx } from 'clsx';
import Badge from './ui/Badge';

export interface ScheduleBlockProps {
  serviceType: string;
  customerName: string;
  timeRange: string;
  crew: string;
  color?: string;
  className?: string;
}

const serviceColors: Record<string, string> = {
  Mowing: 'border-l-green-500 bg-green-50',
  Landscaping: 'border-l-amber-600 bg-amber-50',
  'Snow Removal': 'border-l-blue-400 bg-blue-50',
  'Clean-up': 'border-l-orange-400 bg-orange-50',
  Maintenance: 'border-l-purple-500 bg-purple-50',
};

export default function ScheduleBlock({
  serviceType,
  customerName,
  timeRange,
  crew,
  color,
  className,
}: ScheduleBlockProps) {
  const colorClass = color
    ? undefined
    : serviceColors[serviceType] || 'border-l-gray-400 bg-gray-50';

  return (
    <div
      className={clsx(
        'border-l-4 rounded-r-xl px-3 py-2.5',
        colorClass,
        className,
      )}
      style={color ? { borderLeftColor: color, backgroundColor: `${color}10` } : undefined}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-slate-900">{serviceType}</span>
        <Badge variant="info" size="sm">
          {crew}
        </Badge>
      </div>
      <p className="text-sm text-slate-700">{customerName}</p>
      <p className="text-xs text-gray-500 mt-0.5">{timeRange}</p>
    </div>
  );
}
