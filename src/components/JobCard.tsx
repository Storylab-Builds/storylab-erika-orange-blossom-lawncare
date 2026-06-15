import React from 'react';
import { MapPin, Clock, Users } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import StatusDot from './ui/StatusDot';

export type JobStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'normal' | 'high';

export interface JobCardProps {
  customerName: string;
  address: string;
  serviceType: string;
  serviceColor: string;
  timeWindow: string;
  crew: string;
  status: JobStatus;
  priority?: Priority;
  className?: string;
}

const statusBadge: Record<JobStatus, { variant: 'info' | 'warning' | 'success' | 'error'; label: string }> = {
  scheduled: { variant: 'info', label: 'Scheduled' },
  'in-progress': { variant: 'warning', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'error', label: 'Cancelled' },
};

const priorityDot: Record<Priority, 'active' | 'warning' | 'busy'> = {
  low: 'active',
  normal: 'warning',
  high: 'busy',
};

function JobCard({
  customerName,
  address,
  serviceType,
  serviceColor,
  timeWindow,
  crew,
  status,
  priority = 'normal',
  className,
}: JobCardProps) {
  const badge = statusBadge[status];

  return (
    <Card hover className={className}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: serviceColor }} />
          <span className="text-sm font-medium text-slate-700">{serviceType}</span>
        </div>
        <Badge variant={badge.variant} size="sm">
          {badge.label}
        </Badge>
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1">{customerName}</h3>

      <div className="space-y-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeWindow}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{crew}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
        <StatusDot status={priorityDot[priority]} />
        <span className="text-xs text-gray-400 capitalize">{priority} priority</span>
      </div>
    </Card>
  );
}

export default React.memo(JobCard);
