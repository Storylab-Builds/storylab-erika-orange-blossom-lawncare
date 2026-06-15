import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './ui/Card';

export interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendDirection?: 'up' | 'down';
  icon?: React.ReactNode;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  trend,
  trendDirection,
  icon,
  className,
}: StatsCardProps) {
  const isPositive = trendDirection === 'up';

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-accent-light text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && trendDirection && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-error" />
          )}
          <span
            className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {trend}%
          </span>
          <span className="text-sm text-gray-400">vs last week</span>
        </div>
      )}
    </Card>
  );
}
