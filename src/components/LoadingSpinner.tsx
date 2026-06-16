import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
  fullPage?: boolean;
}

const sizeMap: Record<string, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

const labelSizeMap: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export default function LoadingSpinner({
  size = 'md',
  className,
  label,
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', fullPage && 'min-h-[400px] justify-center')}>
      <div
        className={cn(
          'rounded-full border-gray-200 dark:border-gray-700 border-t-indigo-500 animate-spin',
          sizeMap[size],
          className,
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className={cn('text-slate-500 dark:text-gray-400 font-medium', labelSizeMap[size])}>
          {label}
        </p>
      )}
    </div>
  );

  return spinner;
}
