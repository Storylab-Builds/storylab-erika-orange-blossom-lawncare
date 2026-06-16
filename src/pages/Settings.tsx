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
  Plug,
  Lock,
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

// Default base prices ($) per service. Used to seed the editable services map.
const DEFAULT_SERVICE_PRICES: Record<string, number> = {
  mowing: 45,
  landscaping: 250,
  mulching: 180,
  'snow-removal': 75,
  'spring-cleanup': 220,
  'fall-cleanup': 220,
  fertilization: 65,
  'bed-maintenance': 95,
  'shrub-trimming': 120,
  'leaf-removal': 150,
  emergency: 200,
};

type ServiceConfig = {
  label: string;
  basePrice: number;
  active: boolean;
};

/** Build the default editable service map from the SERVICE_TYPES constant. */
const DEFAULT_SERVICE_CONFIG: Record<string, ServiceConfig> = Object.fromEntries(
  Object.entries(SERVICE_TYPES).map(([key, conf]) => [
    key,
    {
      label: conf.label,
      basePrice: DEFAULT_SERVICE_PRICES[key] ?? 0,
      active: !['snow-removal', 'fall-cleanup', 'leaf-removal'].includes(key),
    } as ServiceConfig,
  ]),
);

type NotificationTemplate = {
  name: string;
  channel: 'sms' | 'email' | 'both';
  active: boolean;
  text: string;
};

const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    name: 'Service Reminder (24hr)',
    channel: 'sms',
    active: true,
    text: 'Hi {{customerName}}, this is a reminder that {{companyName}} is scheduled to service your property tomorrow at {{time}}. Reply STOP to opt out.',
  },
  {
    name: 'Service Completed',
    channel: 'email',
    active: true,
    text: 'Hi {{customerName}}, your {{serviceType}} service has been completed by {{crewName}}. Thank you for choosing {{companyName}}!',
  },
  {
    name: 'Weather Reschedule',
    channel: 'both',
    active: true,
    text: 'Hi {{customerName}}, due to weather conditions we have rescheduled your service to {{newDate}}. Sorry for any inconvenience.',
  },
  {
    name: 'Invoice / Payment Due',
    channel: 'email',
    active: true,
    text: 'Hi {{customerName}}, your invoice #{{invoiceNumber}} for {{amount}} is now due. Please pay by {{dueDate}}.',
  },
  {
    name: 'Crew En Route',
    channel: 'sms',
    active: true,
    text: 'Hi {{customerName}}, {{crewName}} is on the way to your property and should arrive within {{eta}}.',
  },
  {
    name: 'Monthly Summary',
    channel: 'email',
    active: false,
    text: 'Hi {{customerName}}, here is your monthly summary from {{companyName}}: {{serviceCount}} services completed.',
  },
  {
    name: 'Seasonal Promotion',
    channel: 'email',
    active: false,
    text: 'Hi {{customerName}}, book your seasonal {{serviceType}} with {{companyName}} and save {{discount}}!',
  },
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

// Integrations: a flat map of provider field keys → secret values stored in the DB.
type IntegrationsMap = Record<string, string>;

type IntegrationGroup = {
  provider: string;
  description: string;
  fields: { key: string; label: string; placeholder: string }[];
};

const INTEGRATION_GROUPS: IntegrationGroup[] = [
  {
    provider: 'Twilio',
    description: 'SMS notifications (reminders, crew en route).',
    fields: [
      { key: 'twilioAccountSid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxx' },
      { key: 'twilioAuthToken', label: 'Auth Token', placeholder: 'your auth token' },
      { key: 'twilioFromNumber', label: 'From Number', placeholder: '+13305550100' },
    ],
  },
  {
    provider: 'Stripe',
    description: 'Invoicing and online payments.',
    fields: [{ key: 'stripeSecretKey', label: 'Secret Key', placeholder: 'sk_live_…' }],
  },
  {
    provider: 'Mapbox',
    description: 'Maps and route optimization for field ops.',
    fields: [{ key: 'mapboxToken', label: 'Access Token', placeholder: 'pk.eyJ…' }],
  },
  {
    provider: 'Resend',
    description: 'Transactional email (invoices, summaries).',
    fields: [{ key: 'resendApiKey', label: 'API Key', placeholder: 're_…' }],
  },
  {
    provider: 'Google Calendar',
    description: 'Two-way schedule sync.',
    fields: [
      { key: 'googleCalendarClientId', label: 'Client ID', placeholder: 'xxxx.apps.googleusercontent.com' },
      { key: 'googleCalendarClientSecret', label: 'Client Secret', placeholder: 'GOCSPX-…' },
    ],
  },
  {
    provider: 'Sentry',
    description: 'Error monitoring and alerting.',
    fields: [{ key: 'sentryDsn', label: 'DSN', placeholder: 'https://…@sentry.io/…' }],
  },
];

const DEFAULT_INTEGRATIONS: IntegrationsMap = Object.fromEntries(
  INTEGRATION_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, ''])),
);

type SettingsTab = 'company' | 'services' | 'weather' | 'notifications' | 'hours' | 'integrations';

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
  const saveIntegrations = useSaveSetting();

  // Local controlled state, seeded from hardcoded defaults until settings load.
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [weather, setWeather] = useState<WeatherThresholds>(DEFAULT_WEATHER_THRESHOLDS);
  const [notifications, setNotifications] = useState<NotificationTemplate[]>(
    DEFAULT_NOTIFICATION_TEMPLATES,
  );
  const [hours, setHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);
  const [services, setServices] = useState<Record<string, ServiceConfig>>(
    () => ({ ...DEFAULT_SERVICE_CONFIG }),
  );
  const [integrations, setIntegrations] = useState<IntegrationsMap>(
    () => ({ ...DEFAULT_INTEGRATIONS }),
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
    // Merge persisted per-service overrides over the SERVICE_TYPES defaults.
    if (settings.serviceTypes && typeof settings.serviceTypes === 'object') {
      const persisted = settings.serviceTypes as Record<string, Partial<ServiceConfig>>;
      setServices(() => {
        const merged: Record<string, ServiceConfig> = {};
        for (const [key, base] of Object.entries(DEFAULT_SERVICE_CONFIG)) {
          merged[key] = { ...base, ...(persisted[key] ?? {}) };
        }
        return merged;
      });
    }
    if (settings.integrations && typeof settings.integrations === 'object') {
      setIntegrations((prev) => ({ ...prev, ...(settings.integrations as IntegrationsMap) }));
    }
  }, [settings]);

  const toggleService = (key: string) => {
    setServices((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active },
    }));
  };

  const updateServiceLabel = (key: string, label: string) => {
    setServices((prev) => ({ ...prev, [key]: { ...prev[key], label } }));
  };

  const updateServicePrice = (key: string, basePrice: number) => {
    setServices((prev) => ({ ...prev, [key]: { ...prev[key], basePrice } }));
  };

  const updateIntegration = (key: string, value: string) => {
    setIntegrations((prev) => ({ ...prev, [key]: value }));
  };

  const toggleNotification = (idx: number) => {
    setNotifications((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, active: !t.active } : t)),
    );
  };

  const updateNotificationText = (idx: number, text: string) => {
    setNotifications((prev) => prev.map((t, i) => (i === idx ? { ...t, text } : t)));
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
    { key: 'integrations' as const, label: 'Integrations', icon: Plug },
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
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Service Types & Pricing</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Edit each service name, base price, and whether it's active.</p>
              </div>
              <SaveButton
                onClick={() => saveServices.mutate({ key: 'serviceTypes', value: services })}
                isPending={saveServices.isPending}
                isSuccess={saveServices.isSuccess}
              />
            </div>
            <div className="space-y-3">
              {Object.entries(services).map(([key, svc]) => {
                const isActive = svc.active;
                return (
                  <div key={key} className={`flex items-center gap-4 p-4 rounded-xl border ${isActive ? 'bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700' : 'bg-slate-50 dark:bg-gray-700 border-slate-100 dark:border-gray-700 opacity-60'}`}>
                    <label className="relative inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-checked={isActive}
                        checked={isActive}
                        onChange={() => toggleService(key)}
                        className="sr-only peer"
                        aria-label={`Toggle ${svc.label}`}
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SERVICE_TYPES[key as keyof typeof SERVICE_TYPES]?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <label className="sr-only" htmlFor={`svc-label-${key}`}>{`${svc.label} name`}</label>
                      <input
                        id={`svc-label-${key}`}
                        type="text"
                        value={svc.label}
                        onChange={(e) => updateServiceLabel(key, e.target.value)}
                        aria-label={`${svc.label} name`}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-slate-500 dark:text-gray-400">$</span>
                      <label className="sr-only" htmlFor={`svc-price-${key}`}>{`${svc.label} base price`}</label>
                      <input
                        id={`svc-price-${key}`}
                        type="number"
                        min={0}
                        value={svc.basePrice}
                        onChange={(e) => updateServicePrice(key, Number(e.target.value))}
                        aria-label={`${svc.label} base price`}
                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
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
                <div key={tmpl.name} className="p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
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
                  </div>
                  <div className="mt-3">
                    <label className="sr-only" htmlFor={`notif-text-${idx}`}>{`${tmpl.name} message text`}</label>
                    <textarea
                      id={`notif-text-${idx}`}
                      rows={3}
                      value={tmpl.text}
                      onChange={(e) => updateNotificationText(idx, e.target.value)}
                      aria-label={`${tmpl.name} message text`}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1.5">Use placeholders like {'{{customerName}}'} that get filled in when the message is sent.</p>
                  </div>
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

        {activeTab === 'integrations' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Integrations</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Enter API keys and credentials for third-party services.</p>
              </div>
              <SaveButton
                onClick={() => saveIntegrations.mutate({ key: 'integrations', value: integrations })}
                isPending={saveIntegrations.isPending}
                isSuccess={saveIntegrations.isSuccess}
              />
            </div>

            <div className="mb-6 flex items-start gap-2 rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50 px-4 py-3 text-xs text-slate-500 dark:text-gray-400">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Keys are stored in the database Settings table for the dev team to wire up. Values are masked here and only the configured status is shown after saving.</p>
            </div>

            <div className="space-y-6">
              {INTEGRATION_GROUPS.map((group) => {
                const configured = group.fields.some((f) => (integrations[f.key] ?? '').trim().length > 0);
                return (
                  <div key={group.provider} className="rounded-xl border border-slate-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{group.provider}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">{group.description}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          configured
                            ? 'bg-success/10 text-success'
                            : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400'
                        }`}
                        role="status"
                      >
                        {configured ? 'Configured' : 'Not configured'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {group.fields.map((field) => (
                        <div key={field.key}>
                          <label
                            htmlFor={`integration-${field.key}`}
                            className="block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
                          >
                            {field.label}
                            {(integrations[field.key] ?? '').trim().length > 0 && (
                              <span className="ml-2 inline-flex items-center gap-1 normal-case tracking-normal text-success">
                                <Check className="w-3 h-3" /> saved
                              </span>
                            )}
                          </label>
                          <input
                            id={`integration-${field.key}`}
                            type="password"
                            autoComplete="off"
                            value={integrations[field.key] ?? ''}
                            onChange={(e) => updateIntegration(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            aria-label={`${group.provider} ${field.label}`}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
