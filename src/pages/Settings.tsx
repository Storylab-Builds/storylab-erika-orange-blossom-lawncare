import { useEffect, useState } from 'react';
import {
  Building2,
  Scissors,
  CloudRain,
  Bell,
  Clock,
  Save,
  Check,
  Thermometer,
  Droplets,
  Wind,
  Snowflake,
} from 'lucide-react';
import { SERVICE_TYPES, WEATHER_THRESHOLDS } from '@/lib/constants';
import { useSettings, useSaveSetting } from '@/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type CompanyInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  license: string;
};

const DEFAULT_COMPANY: CompanyInfo = {
  name: 'Orange Blossom Special Lawncare',
  phone: '(330) 555-0100',
  email: 'info@obslawncare.com',
  address: '123 Business Park Dr, Akron, OH 44313',
  website: 'www.obslawncare.com',
  license: 'OH-LC-2024-0847',
};

const serviceEntries = Object.entries(SERVICE_TYPES).map(([key, conf]) => ({
  key,
  label: conf.label,
  active: !['snow-removal', 'fall-cleanup', 'leaf-removal'].includes(key),
}));

const DEFAULT_ACTIVE_SERVICES = serviceEntries.filter((s) => s.active).map((s) => s.key);

type NotificationTemplate = {
  name: string;
  channel: 'sms' | 'email' | 'both';
  active: boolean;
};

const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { name: 'Service Reminder (24hr)', channel: 'sms', active: true },
  { name: 'Service Completed', channel: 'email', active: true },
  { name: 'Weather Reschedule', channel: 'both', active: true },
  { name: 'Invoice / Payment Due', channel: 'email', active: true },
  { name: 'Crew En Route', channel: 'sms', active: true },
  { name: 'Monthly Summary', channel: 'email', active: false },
  { name: 'Seasonal Promotion', channel: 'email', active: false },
];

type WorkingHours = {
  start: string;
  end: string;
  days: string[];
  maxJobsPerCrew: number;
  maxCrewsPerDay: number;
  breakDuration: string;
  travelBuffer: string;
};

const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: '7:00 AM',
  end: '5:00 PM',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  maxJobsPerCrew: 6,
  maxCrewsPerDay: 6,
  breakDuration: '30 min',
  travelBuffer: '15 min',
};

type WeatherThresholds = {
  rainCancel: number;
  rainDelay: number;
  windCancel: number;
  heatCaution: number;
  snowEmergency: number;
};

const DEFAULT_WEATHER_THRESHOLDS: WeatherThresholds = {
  rainCancel: WEATHER_THRESHOLDS.rain.cancelThreshold,
  rainDelay: WEATHER_THRESHOLDS.rain.delayThreshold,
  windCancel: WEATHER_THRESHOLDS.wind.cancelThreshold,
  heatCaution: WEATHER_THRESHOLDS.heat.cautionThreshold,
  snowEmergency: WEATHER_THRESHOLDS.snow.emergencyThreshold,
};

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type SettingsTab = 'company' | 'services' | 'weather' | 'notifications' | 'hours';

/** Saved/Saving indicator driven by a mutation's isPending/isSuccess. */
function SaveButton({
  onClick,
  isPending,
  isSuccess,
  label = 'Save',
}: {
  onClick: () => void;
  isPending: boolean;
  isSuccess: boolean;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {isSuccess && !isPending && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-success" role="status">
          <Check className="w-3.5 h-3.5" /> Saved
        </span>
      )}
      <Button
        onClick={onClick}
        loading={isPending}
        icon={!isPending ? <Save className="w-4 h-4" /> : undefined}
      >
        {isPending ? 'Saving…' : label}
      </Button>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');

  const { data: settings, isLoading, isError } = useSettings();
  const saveCompany = useSaveSetting();
  const saveWeather = useSaveSetting();
  const saveNotifications = useSaveSetting();
  const saveHours = useSaveSetting();
  const saveServices = useSaveSetting();

  // Local controlled state, seeded from hardcoded defaults until settings load.
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [weather, setWeather] = useState<WeatherThresholds>(DEFAULT_WEATHER_THRESHOLDS);
  const [notifications, setNotifications] = useState<NotificationTemplate[]>(
    DEFAULT_NOTIFICATION_TEMPLATES,
  );
  const [hours, setHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);
  const [activeServices, setActiveServices] = useState<Set<string>>(
    () => new Set(DEFAULT_ACTIVE_SERVICES),
  );

  // Sync local state once persisted settings arrive (keys may be absent → keep defaults).
  useEffect(() => {
    if (!settings) return;
    if (settings.company && typeof settings.company === 'object') {
      setCompany((prev) => ({ ...prev, ...(settings.company as Partial<CompanyInfo>) }));
    }
    if (settings.weatherThresholds && typeof settings.weatherThresholds === 'object') {
      setWeather((prev) => ({ ...prev, ...(settings.weatherThresholds as Partial<WeatherThresholds>) }));
    }
    if (Array.isArray(settings.notificationTemplates)) {
      setNotifications(settings.notificationTemplates as NotificationTemplate[]);
    }
    if (settings.workingHours && typeof settings.workingHours === 'object') {
      setHours((prev) => ({ ...prev, ...(settings.workingHours as Partial<WorkingHours>) }));
    }
    if (Array.isArray(settings.activeServices)) {
      setActiveServices(new Set(settings.activeServices as string[]));
    }
  }, [settings]);

  const toggleService = (key: string) => {
    setActiveServices((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleNotification = (idx: number) => {
    setNotifications((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, active: !t.active } : t)),
    );
  };

  const toggleWorkingDay = (day: string) => {
    setHours((prev) => {
      const has = prev.days.includes(day);
      return {
        ...prev,
        days: has ? prev.days.filter((d) => d !== day) : [...prev.days, day],
      };
    });
  };

  const tabs = [
    { key: 'company' as const, label: 'Company', icon: Building2 },
    { key: 'services' as const, label: 'Services & Pricing', icon: Scissors },
    { key: 'weather' as const, label: 'Weather Thresholds', icon: CloudRain },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    { key: 'hours' as const, label: 'Working Hours', icon: Clock },
  ];

  const weatherThresholdFields: {
    label: string;
    field: keyof WeatherThresholds;
    unit: string;
    icon: typeof Droplets;
  }[] = [
    { label: 'Cancel if rain probability above', field: 'rainCancel', unit: '%', icon: Droplets },
    { label: 'Delay if rain probability above', field: 'rainDelay', unit: '%', icon: Droplets },
    { label: 'Cancel if wind speed above', field: 'windCancel', unit: 'mph', icon: Wind },
    { label: 'Caution if temperature above', field: 'heatCaution', unit: '°F', icon: Thermometer },
    { label: 'Snow emergency threshold', field: 'snowEmergency', unit: 'in', icon: Snowflake },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar Tabs */}
      <div className="w-56 flex-shrink-0">
        <nav className="space-y-1" aria-label="Settings navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-current={activeTab === tab.key ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  activeTab === tab.key
                    ? 'bg-accent-light dark:bg-primary/20 text-primary'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isError && (
          <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
            Couldn't load saved settings. Showing defaults — your changes will still be saved.
          </div>
        )}
        {isLoading && (
          <div className="mb-4 rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 px-4 py-3 text-sm text-slate-500 dark:text-gray-400" role="status">
            Loading saved settings…
          </div>
        )}

        {activeTab === 'company' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Company Profile</h3>
              <SaveButton
                onClick={() => saveCompany.mutate({ key: 'company', value: company })}
                isPending={saveCompany.isPending}
                isSuccess={saveCompany.isSuccess}
                label="Save Changes"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              {(Object.keys(DEFAULT_COMPANY) as (keyof CompanyInfo)[]).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    value={company[key]}
                    onChange={(e) => setCompany((prev) => ({ ...prev, [key]: e.target.value }))}
                    aria-label={key.replace(/([A-Z])/g, ' $1').trim()}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'services' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Service Types & Pricing</h3>
              <SaveButton
                onClick={() =>
                  saveServices.mutate({ key: 'activeServices', value: Array.from(activeServices) })
                }
                isPending={saveServices.isPending}
                isSuccess={saveServices.isSuccess}
              />
            </div>
            <div className="space-y-3">
              {serviceEntries.map((svc) => {
                const isActive = activeServices.has(svc.key);
                return (
                  <div key={svc.key} className={`flex items-center gap-4 p-4 rounded-xl border ${isActive ? 'bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700' : 'bg-slate-50 dark:bg-gray-700 border-slate-100 dark:border-gray-700 opacity-60'}`}>
                    <label className="relative inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-checked={isActive}
                        checked={isActive}
                        onChange={() => toggleService(svc.key)}
                        className="sr-only peer"
                        aria-label={`Toggle ${svc.label}`}
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{svc.label}</p>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: SERVICE_TYPES[svc.key as keyof typeof SERVICE_TYPES]?.color }}
                    />
                    <button className="text-xs text-primary hover:underline" aria-label={`Edit ${svc.label}`}>Edit</button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {activeTab === 'weather' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weather Thresholds</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Configure when weather conditions trigger automatic rescheduling</p>
              </div>
              <SaveButton
                onClick={() => saveWeather.mutate({ key: 'weatherThresholds', value: weather })}
                isPending={saveWeather.isPending}
                isSuccess={saveWeather.isSuccess}
              />
            </div>
            <div className="space-y-4">
              {weatherThresholdFields.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.field} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-100 dark:border-gray-700">
                    <Icon className="w-5 h-5 text-slate-400 dark:text-gray-500 flex-shrink-0" />
                    <p className="flex-1 text-sm text-slate-700 dark:text-gray-300">{t.label}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={weather[t.field]}
                        onChange={(e) =>
                          setWeather((prev) => ({ ...prev, [t.field]: Number(e.target.value) }))
                        }
                        aria-label={t.label}
                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <span className="text-sm text-slate-500 dark:text-gray-400 w-8">{t.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Templates</h3>
              <SaveButton
                onClick={() =>
                  saveNotifications.mutate({ key: 'notificationTemplates', value: notifications })
                }
                isPending={saveNotifications.isPending}
                isSuccess={saveNotifications.isSuccess}
              />
            </div>
            <div className="space-y-3">
              {notifications.map((tmpl, idx) => (
                <div key={tmpl.name} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                  <label className="relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-checked={tmpl.active}
                      checked={tmpl.active}
                      onChange={() => toggleNotification(idx)}
                      className="sr-only peer"
                      aria-label={`Toggle ${tmpl.name}`}
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-gray-600 peer-checked:bg-primary rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{tmpl.name}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                    tmpl.channel === 'sms' ? 'bg-success/10 text-success' :
                    tmpl.channel === 'email' ? 'bg-primary/10 text-primary' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {tmpl.channel}
                  </span>
                  <button className="text-xs text-primary hover:underline" aria-label={`Edit ${tmpl.name} template`}>Edit Template</button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'hours' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Working Hours & Capacity</h3>
              <SaveButton
                onClick={() => saveHours.mutate({ key: 'workingHours', value: hours })}
                isPending={saveHours.isPending}
                isSuccess={saveHours.isSuccess}
              />
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Start Time</label>
                <input
                  type="text"
                  value={hours.start}
                  onChange={(e) => setHours((prev) => ({ ...prev, start: e.target.value }))}
                  aria-label="Start time"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">End Time</label>
                <input
                  type="text"
                  value={hours.end}
                  onChange={(e) => setHours((prev) => ({ ...prev, end: e.target.value }))}
                  aria-label="End time"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Max Jobs Per Crew</label>
                <input
                  type="number"
                  value={hours.maxJobsPerCrew}
                  onChange={(e) => setHours((prev) => ({ ...prev, maxJobsPerCrew: Number(e.target.value) }))}
                  aria-label="Max jobs per crew"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Max Crews Per Day</label>
                <input
                  type="number"
                  value={hours.maxCrewsPerDay}
                  onChange={(e) => setHours((prev) => ({ ...prev, maxCrewsPerDay: Number(e.target.value) }))}
                  aria-label="Max crews per day"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Break Duration</label>
                <input
                  type="text"
                  value={hours.breakDuration}
                  onChange={(e) => setHours((prev) => ({ ...prev, breakDuration: e.target.value }))}
                  aria-label="Break duration"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Travel Buffer</label>
                <input
                  type="text"
                  value={hours.travelBuffer}
                  onChange={(e) => setHours((prev) => ({ ...prev, travelBuffer: e.target.value }))}
                  aria-label="Travel buffer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const active = hours.days.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleWorkingDay(day)}
                      aria-label={`${day} ${active ? 'active' : 'inactive'}`}
                      aria-pressed={active}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-gray-700 text-slate-400 dark:text-gray-400 border border-slate-200 dark:border-gray-600'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
