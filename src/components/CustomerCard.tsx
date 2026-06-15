import React from 'react';
import { MapPin, Calendar, DollarSign, Layers } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

export interface CustomerCardProps {
  name: string;
  status: 'active' | 'inactive' | 'pending';
  address: string;
  activeServices: number;
  lastServiceDate: string;
  revenue: string;
  className?: string;
}

const statusBadge: Record<string, { variant: 'success' | 'neutral' | 'warning'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'neutral', label: 'Inactive' },
  pending: { variant: 'warning', label: 'Pending' },
};

function CustomerCard({
  name,
  status,
  address,
  activeServices,
  lastServiceDate,
  revenue,
  className,
}: CustomerCardProps) {
  const b = statusBadge[status];

  return (
    <Card hover className={className}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">{name}</h3>
        <Badge variant={b.variant} size="sm">
          {b.label}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <span>{activeServices} active service{activeServices !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Last service: {lastServiceDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-slate-700">{revenue}/season</span>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(CustomerCard);
