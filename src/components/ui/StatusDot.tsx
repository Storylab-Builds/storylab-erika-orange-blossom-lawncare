import { clsx } from 'clsx';

export interface StatusDotProps {
  status: 'active' | 'inactive' | 'warning' | 'busy';
  className?: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-success',
  inactive: 'bg-gray-300',
  warning: 'bg-warning',
  busy: 'bg-error',
};

export default function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={clsx(
        'inline-block w-2.5 h-2.5 rounded-full',
        statusColors[status],
        className,
      )}
    />
  );
}
