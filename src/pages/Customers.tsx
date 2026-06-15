import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { useCustomers } from '@/hooks';
import { getStatusColor } from '@/lib/utils';
import type { Customer } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

function getStatusBadgeVariant(status: Customer['status']): 'success' | 'neutral' | 'warning' {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'neutral';
    case 'prospect': return 'warning';
    default: return 'neutral';
  }
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusFilterValue = statusFilter === 'all' ? undefined : statusFilter as Customer['status'];

  const { data: customers, isLoading, isError, error } = useCustomers({
    search,
    status: statusFilterValue,
  });

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading customers..." />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-error">Failed to load customers</p>
        <p className="text-sm text-slate-500 mt-1">{(error as Error)?.message ?? 'Unknown error'}</p>
      </div>
    );
  }

  const filtered = customers ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{filtered.length} total customers</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>
          Add Customer
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, address, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search customers"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No customers found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer) => {
            const totalServices = customer.properties.reduce(
              (sum, p) => sum + p.services.filter(s => s.status === 'active').length,
              0,
            );
            const totalLotSize = customer.properties.reduce((sum, p) => sum + p.lotSize, 0);
            const lotDisplay = totalLotSize >= 43560
              ? `${(totalLotSize / 43560).toFixed(1)} acres`
              : `${totalLotSize.toLocaleString()} sqft`;

            return (
              <Link
                key={customer.id}
                to={`/customers/${customer.id}`}
                className="block"
              >
                <Card hover>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {customer.address}, {customer.city}, {customer.state}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">
                        <span className="font-semibold text-slate-700">{totalServices}</span> active services
                      </span>
                      <span className="text-slate-500">
                        <span className="font-semibold text-slate-700">{lotDisplay}</span>
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
