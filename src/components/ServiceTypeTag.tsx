import React from 'react';
import { Scissors, TreePine, Snowflake, Leaf, Wrench } from 'lucide-react';
import { clsx } from 'clsx';

export type ServiceType = 'Mowing' | 'Landscaping' | 'Snow Removal' | 'Clean-up' | 'Maintenance';

export interface ServiceTypeTagProps {
  type: ServiceType;
  className?: string;
}

interface TagConfig {
  icon: React.ReactNode;
  bg: string;
  text: string;
}

const tagConfig: Record<ServiceType, TagConfig> = {
  Mowing: {
    icon: <Scissors className="w-3.5 h-3.5" />,
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  Landscaping: {
    icon: <TreePine className="w-3.5 h-3.5" />,
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  'Snow Removal': {
    icon: <Snowflake className="w-3.5 h-3.5" />,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  'Clean-up': {
    icon: <Leaf className="w-3.5 h-3.5" />,
    bg: 'bg-orange-100',
    text: 'text-orange-700',
  },
  Maintenance: {
    icon: <Wrench className="w-3.5 h-3.5" />,
    bg: 'bg-purple-100',
    text: 'text-purple-700',
  },
};

export default function ServiceTypeTag({ type, className }: ServiceTypeTagProps) {
  const cfg = tagConfig[type];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      {cfg.icon}
      {type}
    </span>
  );
}
