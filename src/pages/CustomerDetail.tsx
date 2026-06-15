import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Home,
  Ruler,
  KeyRound,
  TreePine,
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  StickyNote,
  Edit,
} from 'lucide-react';
import { useCustomer } from '@/hooks';
import { formatCurrency, formatDate, getServiceColor } from '@/lib/utils';
import { SERVICE_TYPES } from '@/lib/constants';
import type { Customer, ServiceAgreement } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
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

function getServiceLabel(type: ServiceAgreement['serviceType']): string {
  return SERVICE_TYPES[type]?.label ?? type;
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, isError } = useCustomer(id ?? null);

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading customer..." />;
  }

  if (isError || !customer) {
    return (
      <div className="space-y-6">
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <div className="text-center py-12">
          <p className="text-lg font-medium text-slate-700">Customer not found</p>
          <p className="text-sm text-slate-500 mt-1">The customer you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const property = customer.properties[0];
  const lotDisplay = property
    ? property.lotSize >= 43560
      ? `${(property.lotSize / 43560).toFixed(1)} acres`
      : `${property.lotSize.toLocaleString()} sqft`
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      {/* Customer Header */}
      <Card padding="lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
              <Badge variant={getStatusBadgeVariant(customer.status)}>
                {customer.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {customer.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {customer.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {customer.address}, {customer.city}, {customer.state} {customer.zip}</span>
            </div>
          </div>
          <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
            Edit
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          {property && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Size</p>
                    <p className="text-sm font-medium text-slate-900">{lotDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium text-slate-900">{customer.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Gate Code</p>
                    <p className="text-sm font-medium text-slate-900">{property.gateCode ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Features</p>
                    <p className="text-sm font-medium text-slate-900">{property.features.length} noted</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {property.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {f}
                  </div>
                ))}
              </div>
              {property.accessInstructions && (
                <div className="mt-4 p-3 rounded-xl bg-warning/5 border border-warning/20">
                  <p className="text-xs font-medium text-warning mb-1">Access Notes</p>
                  <p className="text-sm text-slate-600">{property.accessInstructions}</p>
                </div>
              )}
            </Card>
          )}

          {/* Notes */}
          {customer.notes && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Notes</h3>
              <div className="flex items-start gap-2">
                <StickyNote className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">{customer.notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Services */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Active Services</h3>
            <div className="space-y-3">
              {property?.services
                .filter((s) => s.status === 'active')
                .map((svc) => (
                  <div key={svc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getServiceColor(svc.serviceType)}`}>
                          {getServiceLabel(svc.serviceType)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{formatCurrency(svc.price)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.frequency}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {svc.estimatedDuration} min</span>
                    </div>
                    {svc.nextScheduledDate && (
                      <p className="text-xs text-slate-400 mt-1">Next: {formatDate(svc.nextScheduledDate)}</p>
                    )}
                  </div>
                )) ?? (
                <p className="text-sm text-slate-400">No active services</p>
              )}
            </div>
          </Card>

          {/* Customer Info */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Preferred: {customer.preferredContact}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                Customer since: {formatDate(customer.createdAt)}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
