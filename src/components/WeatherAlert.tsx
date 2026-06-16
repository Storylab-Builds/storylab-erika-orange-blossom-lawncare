import React from 'react';
import { AlertTriangle, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { clsx } from 'clsx';

export type AlertSeverity = 'advisory' | 'watch' | 'warning';
export type AlertType = 'rain' | 'snow' | 'storm' | 'general';

export interface WeatherAlertProps {
  alertType: AlertType;
  severity: AlertSeverity;
  description: string;
  affectedJobs: number;
  onViewAffected?: () => void;
  onAutoReschedule?: () => void;
  className?: string;
}

const alertIcons: Record<AlertType, React.ReactNode> = {
  rain: <CloudRain className="w-5 h-5" />,
  snow: <CloudSnow className="w-5 h-5" />,
  storm: <CloudLightning className="w-5 h-5" />,
  general: <AlertTriangle className="w-5 h-5" />,
};

const severityStyles: Record<AlertSeverity, string> = {
  advisory: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200',
  watch: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200',
  warning: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200',
};

const severityLabel: Record<AlertSeverity, string> = {
  advisory: 'Advisory',
  watch: 'Watch',
  warning: 'Warning',
};

export default function WeatherAlert({
  alertType,
  severity,
  description,
  affectedJobs,
  onViewAffected,
  onAutoReschedule,
  className,
}: WeatherAlertProps) {
  return (
    <div
      className={clsx(
        'flex items-start gap-3 rounded-xl border px-4 py-3',
        severityStyles[severity],
        className,
      )}
    >
      <div className="shrink-0 mt-0.5">{alertIcons[alertType]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold capitalize">
            Weather {severityLabel[severity]}
          </span>
          <span className="text-xs opacity-75">
            {affectedJobs} job{affectedJobs !== 1 ? 's' : ''} affected
          </span>
        </div>
        <p className="text-sm opacity-90">{description}</p>
        <div className="flex gap-2 mt-2.5">
          {onViewAffected && (
            <button
              onClick={onViewAffected}
              className="text-xs font-medium underline underline-offset-2 hover:opacity-80"
            >
              View affected
            </button>
          )}
          {onAutoReschedule && (
            <button
              onClick={onAutoReschedule}
              className="text-xs font-medium underline underline-offset-2 hover:opacity-80"
            >
              Auto-reschedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
