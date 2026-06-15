import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { crews } from '@/data/mockData';
import { SERVICE_TYPES, CREW_STATUSES } from '@/lib/constants';
import type { Crew, ServiceType } from '@/types';
import { getInitials } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatsCard from '@/components/StatsCard';

function getCrewStatusBadge(status: Crew['status']): { variant: 'success' | 'warning' | 'neutral' | 'info'; label: string } {
  switch (status) {
    case 'available': return { variant: 'success', label: 'Available' };
    case 'on-job': return { variant: 'info', label: 'On Job' };
    case 'break': return { variant: 'warning', label: 'On Break' };
    case 'off-duty': return { variant: 'neutral', label: 'Off Duty' };
    default: return { variant: 'neutral', label: status };
  }
}

export default function Crews() {
  const activeCrews = crews.filter((c) => c.status !== 'off-duty').length;
  const totalMembers = crews.reduce((s, c) => s + c.members.length, 0);
  const avgEfficiency = Math.round(crews.reduce((s, c) => s + c.efficiency, 0) / crews.length);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Crews" value={crews.length} />
        <StatsCard title="Active Now" value={activeCrews} />
        <StatsCard title="Team Members" value={totalMembers} />
        <StatsCard title="Avg Efficiency" value={`${avgEfficiency}%`} />
      </div>

      {/* Crew Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {crews.map((crew) => {
          const statusBadge = getCrewStatusBadge(crew.status);
          return (
            <Card key={crew.id} padding="lg">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{crew.name}</h3>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Zone: {crew.serviceZone}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{crew.todayJobsCompleted}/{crew.todayJobsCount}</p>
                  <p className="text-xs text-slate-400">jobs today</p>
                </div>
              </div>

              {/* Members */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Members</p>
                <div className="space-y-1.5">
                  {crew.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {getInitials(m.name)}
                        </div>
                        <span className="text-slate-700">{m.name}</span>
                        <span className="text-xs text-slate-400">({m.role})</span>
                        {m.clockedIn && (
                          <span className="w-2 h-2 rounded-full bg-success" title="Clocked in" />
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone className="w-3 h-3" /> {m.phone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {crew.specialties.map((s) => {
                    const svcConfig = SERVICE_TYPES[s as ServiceType];
                    return (
                      <Badge key={s} variant="info">
                        {svcConfig?.label ?? s}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Equipment</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {crew.equipment.map((eq) => (
                    <div key={eq.id} className="flex items-center gap-1.5 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${eq.status === 'available' || eq.status === 'in-use' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="text-slate-600">{eq.name}</span>
                      {eq.status === 'maintenance' && (
                        <span className="text-[10px] text-warning font-medium">(maint.)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{crew.efficiency}%</p>
                    <p className="text-[10px] text-slate-400">efficiency</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{crew.todayJobsCompleted}</p>
                    <p className="text-[10px] text-slate-400">completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{crew.members.length}</p>
                    <p className="text-[10px] text-slate-400">members</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
