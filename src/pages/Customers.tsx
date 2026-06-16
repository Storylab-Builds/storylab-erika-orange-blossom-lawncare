import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { useCustomers, useCreateCustomer } from '@/hooks';
import type { Customer } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

function getStatusBadgeVariant(status: Customer['status']): 'success' | 'neutral' | 'warning' {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'neutral';
    case 'prospect': return 'warning';
    default: return 'neutral';
  }
}

interface NewCustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: Customer['status'];
}

const EMPTY_FORM: NewCustomerForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  status: 'active',
};

export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<NewCustomerForm>(EMPTY_FORM);

  const statusFilterValue = statusFilter === 'all' ? undefined : statusFilter as Customer['status'];

  const { data: customers, isLoading, isError, error } = useCustomers({
    search,
    status: statusFilterValue,
  });

  const createCustomer = useCreateCustomer();

  function openAddModal() {
    setForm(EMPTY_FORM);
    createCustomer.reset();
    setShowAddModal(true);
  }

  function updateField<K extends keyof NewCustomerForm>(key: K, value: NewCustomerForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createCustomer.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        status: form.status,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setForm(EMPTY_FORM);
        },
      },
    );
  }

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading customers..." />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-error">Failed to load customers</p>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{(error as Error)?.message ?? 'Unknown error'}</p>
      </div>
    );
  }

  const filtered = customers ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-gray-400">{filtered.length} total customers</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          Add Customer
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search customers by name, address, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search customers"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-sm appearance-none bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                <Card hover className="dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {customer.address}, {customer.city}, {customer.state}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" aria-hidden="true" /> {customer.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" aria-hidden="true" /> {customer.email}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500 dark:text-gray-400">
                        <span className="font-semibold text-slate-700 dark:text-gray-300">{totalServices}</span> active services
                      </span>
                      <span className="text-slate-500 dark:text-gray-400">
                        <span className="font-semibold text-slate-700 dark:text-gray-300">{lotDisplay}</span>
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600" aria-hidden="true" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Customer" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Customer full name"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="name@example.com"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="123 Main St"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="City"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <Input
              label="State"
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="ST"
            />
            <Input
              label="Zip"
              value={form.zip}
              onChange={(e) => updateField('zip', e.target.value)}
              placeholder="00000"
            />
          </div>
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'prospect', label: 'Prospect' },
            ]}
            value={form.status}
            onChange={(value) => updateField('status', value as Customer['status'])}
          />

          {createCustomer.isError && (
            <p className="text-sm text-error">
              {(createCustomer.error as Error)?.message ?? 'Failed to add customer. Please try again.'}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              loading={createCustomer.isPending}
              disabled={!form.name.trim()}
            >
              Add Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
