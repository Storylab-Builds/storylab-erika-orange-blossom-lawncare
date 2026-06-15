import Badge from './ui/Badge';

export interface TimelineItemProps {
  date: string;
  serviceType: string;
  crew: string;
  status: 'completed' | 'cancelled' | 'skipped';
  notes?: string;
  isLast?: boolean;
  className?: string;
}

const statusConfig: Record<string, { variant: 'success' | 'error' | 'neutral'; label: string; dotColor: string }> = {
  completed: { variant: 'success', label: 'Completed', dotColor: 'bg-success' },
  cancelled: { variant: 'error', label: 'Cancelled', dotColor: 'bg-error' },
  skipped: { variant: 'neutral', label: 'Skipped', dotColor: 'bg-gray-300' },
};

export default function TimelineItem({
  date,
  serviceType,
  crew,
  status,
  notes,
  isLast = false,
  className,
}: TimelineItemProps) {
  const cfg = statusConfig[status];

  return (
    <div className={`flex gap-4 ${className ?? ''}`}>
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${cfg.dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-slate-900">{serviceType}</span>
          <Badge variant={cfg.variant} size="sm">
            {cfg.label}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mb-1">{date}</p>
        <p className="text-sm text-gray-500">Crew: {crew}</p>
        {notes && (
          <p className="text-sm text-gray-400 mt-1 italic">{notes}</p>
        )}
      </div>
    </div>
  );
}
