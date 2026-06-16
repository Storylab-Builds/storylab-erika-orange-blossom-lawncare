import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Droplets, Wind } from 'lucide-react';
import Card from './ui/Card';

interface ForecastDay {
  day: string;
  icon: React.ReactNode;
  high: number;
  low: number;
}

export interface WeatherWidgetProps {
  className?: string;
}

const mockForecast: ForecastDay[] = [
  { day: 'Tue', icon: <Sun className="w-5 h-5 text-amber-400" />, high: 78, low: 58 },
  { day: 'Wed', icon: <Cloud className="w-5 h-5 text-gray-400" />, high: 72, low: 55 },
  { day: 'Thu', icon: <CloudRain className="w-5 h-5 text-blue-400" />, high: 65, low: 52 },
  { day: 'Fri', icon: <Sun className="w-5 h-5 text-amber-400" />, high: 74, low: 56 },
  { day: 'Sat', icon: <Cloud className="w-5 h-5 text-gray-400" />, high: 70, low: 54 },
];

type ImpactLevel = 'clear' | 'watch' | 'alert';

const impactConfig: Record<ImpactLevel, { color: string; label: string }> = {
  clear: { color: 'bg-success', label: 'Clear for service' },
  watch: { color: 'bg-warning', label: 'Weather watch' },
  alert: { color: 'bg-error', label: 'Weather alert' },
};

export default function WeatherWidget({ className }: WeatherWidgetProps) {
  const impact: ImpactLevel = 'clear';
  const { color, label } = impactConfig[impact];

  return (
    <Card className={className}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Akron, OH</p>
          <div className="flex items-center gap-3">
            <Sun className="w-10 h-10 text-amber-400" />
            <span className="text-4xl font-bold text-slate-900 dark:text-white">74&deg;</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mostly Sunny</p>
        </div>
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-1 justify-end">
            <span>H: 78&deg;</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>L: 56&deg;</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Droplets className="w-3.5 h-3.5" />
            <span>32%</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Wind className="w-3.5 h-3.5" />
            <span>8 mph</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{label}</span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {mockForecast.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1 py-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{d.day}</span>
            {d.icon}
            <span className="text-xs font-semibold text-slate-900 dark:text-white">{d.high}&deg;</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{d.low}&deg;</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
