import {
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useWeather } from '@/hooks';
import { formatDate } from '@/lib/utils';
import type { WeatherData, DayForecast, WeatherAlert as WeatherAlertType } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

function getConditionIcon(condition: string) {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('shower') || lower.includes('storm')) return CloudRain;
  if (lower.includes('cloud') || lower.includes('overcast')) return Cloud;
  return Sun;
}

function getImpactColor(impact: DayForecast['impact']): string {
  switch (impact) {
    case 'none': return 'text-success';
    case 'low': return 'text-slate-500';
    case 'moderate': return 'text-warning';
    case 'high':
    case 'severe': return 'text-error';
    default: return 'text-slate-400';
  }
}

function getSeverityStyle(severity: WeatherAlertType['severity']): { bg: string; text: string; border: string } {
  switch (severity) {
    case 'warning': return { bg: 'bg-error/5', text: 'text-error', border: 'border-error/20' };
    case 'watch': return { bg: 'bg-warning/5', text: 'text-warning', border: 'border-warning/20' };
    case 'advisory': return { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/20' };
    default: return { bg: 'bg-slate-50 dark:bg-gray-700', text: 'text-slate-600 dark:text-gray-300', border: 'border-slate-200 dark:border-gray-600' };
  }
}

export default function Weather() {
  const { data: weather, isLoading, isError } = useWeather();

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading weather data..." />;
  }

  if (isError || !weather) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-error">Failed to load weather data</p>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Please try again later.</p>
      </div>
    );
  }

  const { current, forecast, alerts } = weather;
  const CurrentIcon = getConditionIcon(current.condition);

  return (
    <div className="space-y-6">
      {/* Current Conditions */}
      <Card padding="lg" className="dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <CurrentIcon className="w-16 h-16 text-warning" aria-hidden="true" />
            <div>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{current.temp}&#176;F</p>
              <p className="text-slate-500 dark:text-gray-400 mt-1 capitalize">{current.condition} - NE Ohio</p>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Updated just now</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-slate-400 dark:text-gray-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400 dark:text-gray-500">Feels Like</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{current.feelsLike}&#176;F</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-slate-400 dark:text-gray-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400 dark:text-gray-500">Humidity</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{current.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-slate-400 dark:text-gray-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400 dark:text-gray-500">Wind</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{current.windSpeed} mph</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400 dark:text-gray-500" aria-hidden="true" />
              <div>
                <p className="text-xs text-slate-400 dark:text-gray-500">Condition</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{current.condition}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 7-Day Forecast */}
      <Card padding="lg" className="dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">7-Day Forecast</h3>
        <div className="grid grid-cols-7 gap-3">
          {forecast.map((day, idx) => {
            const DayIcon = getConditionIcon(day.condition);
            return (
              <div
                key={idx}
                className={`text-center p-3 rounded-xl border ${
                  day.impact === 'high' || day.impact === 'severe' ? 'bg-error/5 border-error/20' :
                  day.impact === 'moderate' ? 'bg-warning/5 border-warning/20' :
                  'bg-slate-50 dark:bg-gray-700 border-slate-100 dark:border-gray-600'
                }`}
              >
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                  {idx === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-xs text-slate-400 dark:text-gray-500">{formatDate(day.date).replace(/, \d{4}$/, '')}</p>
                <DayIcon className={`w-8 h-8 mx-auto my-2 ${
                  day.impact === 'high' || day.impact === 'severe' ? 'text-error' :
                  day.impact === 'moderate' ? 'text-warning' : 'text-slate-400 dark:text-gray-500'
                }`} aria-hidden="true" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">{day.high}&#176;</p>
                <p className="text-xs text-slate-400 dark:text-gray-500">{day.low}&#176;</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" aria-hidden="true" />
                    <span className="text-xs text-slate-500 dark:text-gray-400">{day.precipChance}%</span>
                  </div>
                </div>
                <p className={`text-[10px] font-medium mt-1 capitalize ${getImpactColor(day.impact)}`}>
                  {day.impact === 'none' ? 'Clear' : `${day.impact} impact`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card padding="lg" className="dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-warning" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Weather Alerts</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const st = getSeverityStyle(alert.severity);
              return (
                <div key={alert.id} className={`p-4 rounded-xl border ${st.bg} ${st.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${st.text}`}>{alert.title}</span>
                    <Badge
                      variant={alert.severity === 'warning' ? 'error' : alert.severity === 'watch' ? 'warning' : 'info'}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {formatDate(alert.startTime)} - {formatDate(alert.endTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {alert.affectedJobs} jobs affected
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
