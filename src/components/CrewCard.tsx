import React from 'react';
import { Users, Wrench } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import StatusDot from './ui/StatusDot';

export type CrewStatus = 'available' | 'on-job' | 'off-duty';

export interface CrewCardProps {
  name: string;
  memberCount: number;
  specialties: string[];
  status: CrewStatus;
  jobsCompleted: number;
  jobsTotal: number;
  equipment: string[];
  className?: string;
}

const statusMap: Record<CrewStatus, { dot: 'active' | 'busy' | 'inactive'; label: string }> = {
  available: { dot: 'active', label: 'Available' },
  'on-job': { dot: 'busy', label: 'On Job' },
  'off-duty': { dot: 'inactive', label: 'Off Duty' },
};

function CrewCard({
  name,
  memberCount,
  specialties,
  status,
  jobsCompleted,
  jobsTotal,
  equipment,
  className,
}: CrewCardProps) {
  const s = statusMap[status];
  const progressPct = jobsTotal > 0 ? Math.round((jobsCompleted / jobsTotal) * 100) : 0;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-500">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount} members</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot status={s.dot} />
          <span className="text-sm font-medium text-slate-700">{s.label}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {specialties.map((sp) => (
          <Badge key={sp} variant="info" size="sm">
            {sp}
          </Badge>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-500">Today&apos;s Progress</span>
          <span className="font-medium text-slate-900">
            {jobsCompleted}/{jobsTotal} jobs
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Equipment</p>
        <div className="flex flex-wrap gap-2">
          {equipment.map((eq) => (
            <div key={eq} className="flex items-center gap-1 text-sm text-slate-700">
              <Wrench className="w-3.5 h-3.5 text-gray-400" />
              <span>{eq}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default React.memo(CrewCard);
