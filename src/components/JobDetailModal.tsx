import { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Users,
  StickyNote,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useUpdateJob, useDeleteJob } from '@/hooks';
import { formatDate } from '@/lib/utils';
import { SERVICE_TYPES } from '@/lib/constants';
import type { Job } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusBadgeVariant(
  status: Job['status'],
): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'completed': return 'success';
    case 'in-progress': return 'info';
    case 'scheduled': return 'neutral';
    case 'cancelled': return 'error';
    case 'weather-delayed': return 'warning';
    case 'rescheduled': return 'warning';
    default: return 'neutral';
  }
}

function getServiceLabel(type: Job['serviceType']): string {
  return SERVICE_TYPES[type]?.label ?? type;
}

export default function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset transient state + mutation status each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setConfirmingDelete(false);
      updateJob.reset();
      deleteJob.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, job?.id]);

  if (!job) return null;

  const isCompleted = job.status === 'completed';

  const handleMarkComplete = () => {
    updateJob.mutate(
      { id: job.id, status: 'completed' },
      { onSuccess: () => onClose() },
    );
  };

  const handleDelete = () => {
    deleteJob.mutate(job.id, { onSuccess: () => onClose() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Job Details" size="md">
      <div className="space-y-5">
        {/* Service + status header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: SERVICE_TYPES[job.serviceType]?.color ?? '#6366F1' }}
              aria-hidden="true"
            />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {getServiceLabel(job.serviceType)}
            </h3>
          </div>
          <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
        </div>

        {/* Details grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <User className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
            <span className="text-slate-900 dark:text-white font-medium">{job.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
            {job.propertyAddress}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
            {formatDate(job.scheduledDate)}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <Clock className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
            {job.startTime} &ndash; {job.endTime}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
            <Users className="w-4 h-4 text-slate-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
            {job.crewName || 'Unassigned'}
          </div>
        </div>

        {/* Notes */}
        {job.notes && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-600">
            <div className="flex items-start gap-2">
              <StickyNote className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-slate-600 dark:text-gray-400">{job.notes}</p>
            </div>
          </div>
        )}

        {/* Mutation errors */}
        {updateJob.isError && (
          <p className="text-sm text-error">
            {(updateJob.error as Error)?.message ?? 'Failed to update the job. Please try again.'}
          </p>
        )}
        {deleteJob.isError && (
          <p className="text-sm text-error">
            {(deleteJob.error as Error)?.message ?? 'Failed to delete the job. Please try again.'}
          </p>
        )}

        {/* Delete confirmation step */}
        {confirmingDelete ? (
          <div className="p-4 rounded-xl bg-error/5 border border-error/20 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-error mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-gray-300">
                Delete this job for <span className="font-medium">{job.customerName}</span>? This
                cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleteJob.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
                loading={deleteJob.isPending}
              >
                Delete Job
              </Button>
            </div>
          </div>
        ) : (
          /* Actions */
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setConfirmingDelete(true)}
              className="border-error text-error hover:bg-error/10 active:bg-error/20"
            >
              Delete Job
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              {!isCompleted && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleMarkComplete}
                  loading={updateJob.isPending}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
