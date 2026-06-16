import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Cloud,
  UserPlus,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export type ActivityType = 'completed' | 'alert' | 'weather' | 'customer' | 'schedule' | 'message';

export interface ActivityItemProps {
  type: ActivityType;
  description: string;
  timestamp: string;
  entityLabel?: string;
  onEntityClick?: () => void;
  className?: string;
}

const typeIcon: Record<ActivityType, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  alert: <AlertTriangle className="w-4 h-4 text-warning" />,
  weather: <Cloud className="w-4 h-4 text-blue-400" />,
  customer: <UserPlus className="w-4 h-4 text-primary" />,
  schedule: <Calendar className="w-4 h-4 text-accent" />,
  message: <MessageSquare className="w-4 h-4 text-primary-light" />,
};

function ActivityItem({
  type,
  description,
  timestamp,
  entityLabel,
  onEntityClick,
  className,
}: ActivityItemProps) {
  return (
    <div className={`flex items-start gap-3 py-3 ${className ?? ''}`}>
      <div className="mt-0.5 w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0">
        {typeIcon[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 dark:text-gray-200">
          {description}
          {entityLabel && onEntityClick && (
            <>
              {' '}
              <button
                onClick={onEntityClick}
                className="text-primary hover:text-primary-dark font-medium"
              >
                {entityLabel}
              </button>
            </>
          )}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timestamp}</p>
      </div>
    </div>
  );
}

export default React.memo(ActivityItem);
