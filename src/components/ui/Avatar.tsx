import { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export default function Avatar({
  name,
  src,
  size = 'md',
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-accent-light text-primary font-semibold',
        'flex items-center justify-center',
        sizeStyles[size],
        className,
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
