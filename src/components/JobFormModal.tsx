import { useEffect, useMemo, useState } from 'react';
import { useCustomers, useCrews, useCreateJob } from '@/hooks';
import { SERVICE_TYPES } from '@/lib/constants';
import type { Job, ServiceType } from '@/types';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill the scheduled date (yyyy-MM-dd), e.g. the visible week start. */
  defaultDate?: string;
}

type Priority = Job['priority'];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const SERVICE_OPTIONS = (Object.entries(SERVICE_TYPES) as [ServiceType, { label: string }][]).map(
  ([value, conf]) => ({ value, label: conf.label }),
);

interface FormState {
  customerId: string;
  customerName: string;
  propertyAddress: string;
  serviceType: ServiceType | '';
  scheduledDate: string;
  startTime: string;
  endTime: string;
  crewId: string;
  crewName: string;
  priority: Priority;
  notes: string;
}

function makeInitialState(defaultDate?: string): FormState {
  return {
    customerId: '',
    customerName: '',
    propertyAddress: '',
    serviceType: '',
    scheduledDate: defaultDate ?? '',
    startTime: '09:00',
    endTime: '10:00',
    crewId: '',
    crewName: '',
    priority: 'normal',
    notes: '',
  };
}

export default function JobFormModal({ isOpen, onClose, defaultDate }: JobFormModalProps) {
  const { data: customers } = useCustomers();
  const { data: crews } = useCrews();
  const createJob = useCreateJob();

  const [form, setForm] = useState<FormState>(() => makeInitialState(defaultDate));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Reset the form each time the modal opens (and pick up the latest default date).
  useEffect(() => {
    if (isOpen) {
      setForm(makeInitialState(defaultDate));
      setErrors({});
      createJob.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultDate]);

  const customerOptions = useMemo(
    () => (customers ?? []).map((c) => ({ value: c.id, label: c.name })),
    [customers],
  );

  const crewOptions = useMemo(
    () => (crews ?? []).map((c) => ({ value: c.id, label: c.name })),
    [crews],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = (customers ?? []).find((c) => c.id === customerId);
    const firstProperty = customer?.properties?.[0];
    setForm((prev) => ({
      ...prev,
      customerId,
      customerName: customer?.name ?? '',
      propertyAddress: firstProperty?.address ?? customer?.address ?? '',
    }));
    setErrors((prev) => ({ ...prev, customerId: undefined, propertyAddress: undefined }));
  };

  const handleCrewChange = (crewId: string) => {
    const crew = (crews ?? []).find((c) => c.id === crewId);
    setForm((prev) => ({ ...prev, crewId, crewName: crew?.name ?? '' }));
    setErrors((prev) => ({ ...prev, crewName: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.customerId) next.customerId = 'Select a customer';
    if (!form.serviceType) next.serviceType = 'Select a service type';
    if (!form.scheduledDate) next.scheduledDate = 'Pick a date';
    if (!form.startTime) next.startTime = 'Required';
    if (!form.endTime) next.endTime = 'Required';
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      next.endTime = 'End must be after start';
    }
    if (!form.crewId) next.crewName = 'Select a crew';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<Job> = {
      customerId: form.customerId,
      customerName: form.customerName,
      propertyAddress: form.propertyAddress,
      serviceType: form.serviceType as ServiceType,
      scheduledDate: form.scheduledDate,
      startTime: form.startTime,
      endTime: form.endTime,
      crewId: form.crewId || undefined,
      crewName: form.crewName,
      status: 'scheduled',
      priority: form.priority,
      notes: form.notes || undefined,
      weatherAffected: false,
    };

    createJob.mutate(payload, { onSuccess: () => onClose() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Job" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer */}
        <div>
          <Select
            label="Customer"
            placeholder="Select a customer"
            options={customerOptions}
            value={form.customerId}
            onChange={handleCustomerChange}
          />
          {errors.customerId && <p className="mt-1.5 text-sm text-error">{errors.customerId}</p>}
        </div>

        {/* Property address (auto-filled, editable) */}
        <Input
          label="Property Address"
          placeholder="Auto-filled from customer"
          value={form.propertyAddress}
          onChange={(e) => update('propertyAddress', e.target.value)}
          error={errors.propertyAddress}
        />

        {/* Service type */}
        <div>
          <Select
            label="Service Type"
            placeholder="Select a service"
            options={SERVICE_OPTIONS}
            value={form.serviceType}
            onChange={(v) => update('serviceType', v as ServiceType)}
          />
          {errors.serviceType && <p className="mt-1.5 text-sm text-error">{errors.serviceType}</p>}
        </div>

        {/* Date + times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Date"
            type="date"
            value={form.scheduledDate}
            onChange={(e) => update('scheduledDate', e.target.value)}
            error={errors.scheduledDate}
          />
          <Input
            label="Start Time"
            type="time"
            value={form.startTime}
            onChange={(e) => update('startTime', e.target.value)}
            error={errors.startTime}
          />
          <Input
            label="End Time"
            type="time"
            value={form.endTime}
            onChange={(e) => update('endTime', e.target.value)}
            error={errors.endTime}
          />
        </div>

        {/* Crew + priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Crew"
              placeholder="Select a crew"
              options={crewOptions}
              value={form.crewId}
              onChange={handleCrewChange}
            />
            {errors.crewName && <p className="mt-1.5 text-sm text-error">{errors.crewName}</p>}
          </div>
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(v) => update('priority', v as Priority)}
          />
        </div>

        {/* Notes */}
        <div className="w-full">
          <label
            htmlFor="job-notes"
            className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5"
          >
            Notes
          </label>
          <textarea
            id="job-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Optional notes for the crew"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-gray-300 dark:hover:border-gray-600 resize-none"
          />
        </div>

        {createJob.isError && (
          <p className="text-sm text-error">
            Couldn&apos;t create the job. Please try again.
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createJob.isPending}>
            Create Job
          </Button>
        </div>
      </form>
    </Modal>
  );
}
