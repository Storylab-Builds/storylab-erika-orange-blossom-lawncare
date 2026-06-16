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
  MessageSquare,
  Send,
} from 'lucide-react';
import { SERVICE_TYPES, WEATHER_THRESHOLDS } from '@/lib/constants';
import { useSettings, useSaveSetting } from '@/hooks';
import { useSendTestSms } from '@/hooks/useMessages';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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

// --- Notification templates (3 real keys consumed by the server) ---
type TemplateKey = 'appointment-reminder' | 'on-the-way' | 'job-complete';
type Templates = Record<TemplateKey, string>;

const DEFAULT_TEMPLATES: Templates = {
  'appointment-reminder':
    'Hi {{customerName}}, reminder: {{companyName}} services your property tomorrow at {{time}}. Reply STOP to opt out.',
  'on-the-way':
    'Hi {{customerName}}, {{crewName}} is on the way and should arrive within {{eta}}.',
  'job-complete':
    'Hi {{customerName}}, your {{serviceType}} service is complete. Thank you for choosing {{companyName}}!',
};

const TEMPLATE_META: { key: TemplateKey; label: string; channel: 'sms' | 'email' }[] = [
  { key: 'appointment-reminder', label: 'Appointment Reminder', channel: 'sms' },
  { key: 'on-the-way', label: 'On The Way', channel: 'sms' },
  { key: 'job-complete', label: 'Job Complete', channel: 'email' },
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

// --- Integration state shapes ---
type IntegrationSecretField = {
  configured: boolean;
  source: 'settings' | 'environment' | 'none';
  masked: string;
};
type TwilioState = { accountSid: string; authToken: string; fromNumber: string; enabled: boolean };
type ResendState = { apiKey: string; from: string; quoteInbox: string; enabled: boolean };
type ChannelToggles = { smsEnabled: boolean; emailEnabled: boolean };

const INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';
const LABEL_CLASS =
  'block text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5';

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

/** Badge that reflects whether a secret is set and where it comes from. */
function ConfiguredBadge({ meta }: { meta?: IntegrationSecretField }) {
  if (!meta?.configured) return <Badge variant="neutral">Not configured</Badge>;
  return (
    <Badge variant={meta.source === 'environment' ? 'info' : 'success'}>
      Configured · {meta.source === 'environment' ? '.env' : 'settings'}
    </Badge>
  );
}

/** Accessible on/off switch row matching the existing peer-checkbox style. */
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center gap-4 cursor-pointer">
      <span className="relative inline-flex">
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          aria-label={label}
        />
        <span className="w-9 h-5 bg-slate-200 dark:bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-900 dark:text-white">{label}</span>
        {description && (
          <span className="block text-xs text-slate-500 dark:text-gray-400">{description}</span>
        )}
      </span>
    </label>
  );
}

/** Override-only secret input: blank by default, masked current value as placeholder. */
function SecretInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  meta,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  meta?: IntegrationSecretField;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className={LABEL_CLASS + ' mb-0'}>
          {label}
        </label>
        <ConfiguredBadge meta={meta} />
      </div>
      <input
        id={id}
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={meta?.masked || placeholder}
        aria-label={label}
        className={INPUT_CLASS}
      />
    </div>
  );
}

export default function Settings() {
  // --- ALL hooks declared up front, before any early return ---
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');

  const { data: settings, isLoading, isError } = useSettings();
  const saveCompany = useSaveSetting();
  const saveServices = useSaveSetting();
  const saveWeather = useSaveSetting();
  const saveHours = useSaveSetting();
  const saveTemplates = useSaveSetting(); // key: 'notifications'
  const saveIntegrations = useSaveSetting(); // key: 'integrations'
  const sendTestSms = useSendTestSms();

  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [services, setServices] = useState<Record<string, ServiceConfig>>(
    () => ({ ...DEFAULT_SERVICE_CONFIG }),
  );
  const [weather, setWeather] = useState<WeatherThresholds>(DEFAULT_WEATHER_THRESHOLDS);
  const [hours, setHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);
  const [templates, setTemplates] = useState<Templates>(DEFAULT_TEMPLATES);

  const [twilio, setTwilio] = useState<TwilioState>({
    accountSid: '',
    authToken: '',
    fromNumber: '',
    enabled: true,
  });
  const [resend, setResend] = useState<ResendState>({
    apiKey: '',
    from: '',
    quoteInbox: '',
    enabled: true,
  });
  const [channels, setChannels] = useState<ChannelToggles>({ smsEnabled: true, emailEnabled: true });
  const [testPhone, setTestPhone] = useState('');

  // Read-only mask/configured metadata derived from the server (never seeded into inputs).
  const [twilioMeta, setTwilioMeta] = useState<Record<string, IntegrationSecretField>>({});
  const [resendMeta, setResendMeta] = useState<Record<string, IntegrationSecretField>>({});

  // Sync local state once persisted settings arrive (keys may be absent → keep defaults).
  useEffect(() => {
    if (!settings) return;
    syncBasicSections(settings, { setCompany, setWeather, setHours, setServices });
    syncIntegrations(settings, { setTwilio, setResend, setChannels, setTwilioMeta, setResendMeta });
    const notif = settings.notifications as { templates?: Partial<Templates> } | undefined;
    if (notif?.templates && typeof notif.templates === 'object') {
      setTemplates((prev) => ({ ...prev, ...notif.templates }));
    }
  }, [settings]);

  const toggleService = (key: string) =>
    setServices((prev) => ({ ...prev, [key]: { ...prev[key], active: !prev[key].active } }));
  const updateServiceLabel = (key: string, label: string) =>
    setServices((prev) => ({ ...prev, [key]: { ...prev[key], label } }));
  const updateServicePrice = (key: string, basePrice: number) =>
    setServices((prev) => ({ ...prev, [key]: { ...prev[key], basePrice } }));

  const updateTemplate = (key: TemplateKey, text: string) =>
    setTemplates((prev) => ({ ...prev, [key]: text }));

  const toggleWorkingDay = (day: string) =>
    setHours((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));

  const handleSaveIntegrations = () => {
    // Send the FULL nested object. Blank/masked secrets => server preserves existing values.
    const value = {
      twilio: {
        accountSid: twilio.accountSid,
        authToken: twilio.authToken,
        fromNumber: twilio.fromNumber,
        enabled: twilio.enabled,
      },
      resend: {
        apiKey: resend.apiKey,
        from: resend.from,
        quoteInbox: resend.quoteInbox,
        enabled: resend.enabled,
      },
      notifications: { smsEnabled: channels.smsEnabled, emailEnabled: channels.emailEnabled },
    };
    saveIntegrations.mutate(
      { key: 'integrations', value },
      {
        onSuccess: () => {
          // Clear override inputs after save; server now holds the new secrets.
          setTwilio((prev) => ({ ...prev, accountSid: '', authToken: '' }));
          setResend((prev) => ({ ...prev, apiKey: '' }));
        },
      },
    );
  };

  const handleSaveTemplates = () => saveTemplates.mutate({ key: 'notifications', value: { templates } });

  const handleSendTest = () => {
    const to = testPhone.trim();
    if (!to) return;
    sendTestSms.mutate({ to });
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
            {saveCompany.isError && (
              <p className="text-error text-xs mb-4">Couldn't save — owner/admin only.</p>
            )}
            <div className="grid grid-cols-2 gap-6">
              {(Object.keys(DEFAULT_COMPANY) as (keyof CompanyInfo)[]).map((key) => (
                <div key={key}>
                  <label className={LABEL_CLASS}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input
                    type="text"
                    value={company[key]}
                    onChange={(e) => setCompany((prev) => ({ ...prev, [key]: e.target.value }))}
                    aria-label={key.replace(/([A-Z])/g, ' $1').trim()}
                    className={INPUT_CLASS}
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
                onClick={handleSaveTemplates}
                isPending={saveTemplates.isPending}
                isSuccess={saveTemplates.isSuccess}
              />
            </div>
            {saveTemplates.isError && (
              <p className="text-error text-xs mb-4">Couldn't save — owner/admin only.</p>
            )}
            <div className="mb-6 flex items-start gap-2 rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50 px-4 py-3 text-xs text-slate-500 dark:text-gray-400">
              <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                These messages are sent for appointment reminders, crew-en-route, and job-complete
                events. Use placeholders like {'{{customerName}}'} that get filled in when the message
                is sent.
              </p>
            </div>
            <div className="space-y-3">
              {TEMPLATE_META.map(({ key, label, channel }) => (
                <div key={key} className="p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="flex-1 text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                    <Badge variant={channel === 'sms' ? 'success' : 'info'}>{channel}</Badge>
                  </div>
                  <label className="sr-only" htmlFor={`tmpl-${key}`}>{`${label} message text`}</label>
                  <textarea
                    id={`tmpl-${key}`}
                    rows={3}
                    value={templates[key]}
                    onChange={(e) => updateTemplate(key, e.target.value)}
                    aria-label={`${label} message text`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-slate-900 dark:text-white text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
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
                <label className={LABEL_CLASS}>Start Time</label>
                <input
                  type="text"
                  value={hours.start}
                  onChange={(e) => setHours((prev) => ({ ...prev, start: e.target.value }))}
                  aria-label="Start time"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>End Time</label>
                <input
                  type="text"
                  value={hours.end}
                  onChange={(e) => setHours((prev) => ({ ...prev, end: e.target.value }))}
                  aria-label="End time"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Max Jobs Per Crew</label>
                <input
                  type="number"
                  value={hours.maxJobsPerCrew}
                  onChange={(e) => setHours((prev) => ({ ...prev, maxJobsPerCrew: Number(e.target.value) }))}
                  aria-label="Max jobs per crew"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Max Crews Per Day</label>
                <input
                  type="number"
                  value={hours.maxCrewsPerDay}
                  onChange={(e) => setHours((prev) => ({ ...prev, maxCrewsPerDay: Number(e.target.value) }))}
                  aria-label="Max crews per day"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Break Duration</label>
                <input
                  type="text"
                  value={hours.breakDuration}
                  onChange={(e) => setHours((prev) => ({ ...prev, breakDuration: e.target.value }))}
                  aria-label="Break duration"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Travel Buffer</label>
                <input
                  type="text"
                  value={hours.travelBuffer}
                  onChange={(e) => setHours((prev) => ({ ...prev, travelBuffer: e.target.value }))}
                  aria-label="Travel buffer"
                  className={INPUT_CLASS}
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
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Connect Twilio (SMS) and Resend (email), and control which channels actually send.</p>
              </div>
              <SaveButton
                onClick={handleSaveIntegrations}
                isPending={saveIntegrations.isPending}
                isSuccess={saveIntegrations.isSuccess}
              />
            </div>

            {saveIntegrations.isError && (
              <p className="text-error text-xs mb-4">Couldn't save — owner/admin only.</p>
            )}

            <div className="mb-6 flex items-start gap-2 rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50 px-4 py-3 text-xs text-slate-500 dark:text-gray-400">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Secrets are masked. Leave a field blank to keep the current value. Status badges show
                whether each credential comes from Settings or the environment.
              </p>
            </div>

            {/* Channel toggles — gate whether messages are actually sent */}
            <div className="rounded-xl border border-slate-100 dark:border-gray-700 p-4 mb-6">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Notification Channels</p>
              <div className="space-y-3">
                <ToggleSwitch
                  checked={channels.smsEnabled}
                  onChange={(v) => setChannels((prev) => ({ ...prev, smsEnabled: v }))}
                  label="SMS enabled"
                  description="Gates whether SMS messages are actually sent via Twilio."
                />
                <ToggleSwitch
                  checked={channels.emailEnabled}
                  onChange={(v) => setChannels((prev) => ({ ...prev, emailEnabled: v }))}
                  label="Email enabled"
                  description="Gates whether email messages are actually sent via Resend."
                />
              </div>
            </div>

            {/* Twilio */}
            <div className="rounded-xl border border-slate-100 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Twilio</p>
                  <Badge variant={twilio.enabled ? 'success' : 'neutral'}>
                    {twilio.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div className="mb-4">
                <ToggleSwitch
                  checked={twilio.enabled}
                  onChange={(v) => setTwilio((prev) => ({ ...prev, enabled: v }))}
                  label="Enable Twilio provider"
                  description="Turn the Twilio SMS provider on or off."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SecretInput
                  id="twilio-account-sid"
                  label="Account SID"
                  value={twilio.accountSid}
                  onChange={(v) => setTwilio((prev) => ({ ...prev, accountSid: v }))}
                  placeholder="ACxxxxxxxxxxxxxxxx"
                  meta={twilioMeta.accountSid}
                />
                <SecretInput
                  id="twilio-auth-token"
                  label="Auth Token"
                  value={twilio.authToken}
                  onChange={(v) => setTwilio((prev) => ({ ...prev, authToken: v }))}
                  placeholder="your auth token"
                  meta={twilioMeta.authToken}
                />
                <div className="col-span-2">
                  <label htmlFor="twilio-from-number" className={LABEL_CLASS}>From Number</label>
                  <input
                    id="twilio-from-number"
                    type="text"
                    value={twilio.fromNumber}
                    onChange={(e) => setTwilio((prev) => ({ ...prev, fromNumber: e.target.value }))}
                    placeholder="+13305550100"
                    aria-label="Twilio From Number"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            {/* Resend */}
            <div className="rounded-xl border border-slate-100 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Resend</p>
                  <Badge variant={resend.enabled ? 'success' : 'neutral'}>
                    {resend.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div className="mb-4">
                <ToggleSwitch
                  checked={resend.enabled}
                  onChange={(v) => setResend((prev) => ({ ...prev, enabled: v }))}
                  label="Enable Resend provider"
                  description="Turn the Resend email provider on or off."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <SecretInput
                    id="resend-api-key"
                    label="API Key"
                    value={resend.apiKey}
                    onChange={(v) => setResend((prev) => ({ ...prev, apiKey: v }))}
                    placeholder="re_…"
                    meta={resendMeta.apiKey}
                  />
                </div>
                <div>
                  <label htmlFor="resend-from" className={LABEL_CLASS}>From</label>
                  <input
                    id="resend-from"
                    type="text"
                    value={resend.from}
                    onChange={(e) => setResend((prev) => ({ ...prev, from: e.target.value }))}
                    placeholder="noreply@obslawncare.com"
                    aria-label="Resend From address"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="resend-quote-inbox" className={LABEL_CLASS}>Quote Inbox</label>
                  <input
                    id="resend-quote-inbox"
                    type="text"
                    value={resend.quoteInbox}
                    onChange={(e) => setResend((prev) => ({ ...prev, quoteInbox: e.target.value }))}
                    placeholder="leads@obslawncare.com"
                    aria-label="Resend Quote Inbox"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            {/* Test SMS */}
            <div className="rounded-xl border border-slate-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Send a test SMS</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">
                Sends a real SMS through Twilio to verify your credentials. Requires owner/admin.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1 330 555 0100"
                  aria-label="Test phone number"
                  className={INPUT_CLASS + ' sm:flex-1'}
                />
                <Button
                  onClick={handleSendTest}
                  loading={sendTestSms.isPending}
                  disabled={!testPhone.trim()}
                  icon={!sendTestSms.isPending ? <Send className="w-4 h-4" /> : undefined}
                >
                  Send test SMS
                </Button>
              </div>

              {sendTestSms.data?.success && (
                <div className="mt-3 rounded-xl bg-success/10 px-4 py-3 text-sm text-success" role="status">
                  Sent via {sendTestSms.data.provider} · status {sendTestSms.data.status}
                  {sendTestSms.data.providerId && (
                    <span className="block text-xs opacity-80">Provider ID: {sendTestSms.data.providerId}</span>
                  )}
                </div>
              )}
              {sendTestSms.data && !sendTestSms.data.success && (
                <div className="mt-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
                  {sendTestSms.data.error || 'Failed to send'}
                  <span className="block text-xs opacity-80">Provider: {sendTestSms.data.provider}</span>
                </div>
              )}
              {sendTestSms.isError && (
                <div className="mt-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
                  {(sendTestSms.error as Error).message || 'Failed to send test SMS'}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// --- Sync helpers (kept module-level so the component stays readable) ---

type BasicSetters = {
  setCompany: React.Dispatch<React.SetStateAction<CompanyInfo>>;
  setWeather: React.Dispatch<React.SetStateAction<WeatherThresholds>>;
  setHours: React.Dispatch<React.SetStateAction<WorkingHours>>;
  setServices: React.Dispatch<React.SetStateAction<Record<string, ServiceConfig>>>;
};

/** Merge persisted company/weather/hours/services over the in-memory defaults. */
function syncBasicSections(settings: Record<string, unknown>, s: BasicSetters) {
  if (settings.company && typeof settings.company === 'object') {
    s.setCompany((prev) => ({ ...prev, ...(settings.company as Partial<CompanyInfo>) }));
  }
  if (settings.weatherThresholds && typeof settings.weatherThresholds === 'object') {
    s.setWeather((prev) => ({ ...prev, ...(settings.weatherThresholds as Partial<WeatherThresholds>) }));
  }
  if (settings.workingHours && typeof settings.workingHours === 'object') {
    s.setHours((prev) => ({ ...prev, ...(settings.workingHours as Partial<WorkingHours>) }));
  }
  if (settings.serviceTypes && typeof settings.serviceTypes === 'object') {
    const persisted = settings.serviceTypes as Record<string, Partial<ServiceConfig>>;
    s.setServices(() => {
      const merged: Record<string, ServiceConfig> = {};
      for (const [key, base] of Object.entries(DEFAULT_SERVICE_CONFIG)) {
        merged[key] = { ...base, ...(persisted[key] ?? {}) };
      }
      return merged;
    });
  }
}

type IntegrationSetters = {
  setTwilio: React.Dispatch<React.SetStateAction<TwilioState>>;
  setResend: React.Dispatch<React.SetStateAction<ResendState>>;
  setChannels: React.Dispatch<React.SetStateAction<ChannelToggles>>;
  setTwilioMeta: React.Dispatch<React.SetStateAction<Record<string, IntegrationSecretField>>>;
  setResendMeta: React.Dispatch<React.SetStateAction<Record<string, IntegrationSecretField>>>;
};

type ServerSource = 'settings' | 'environment' | 'none';

/** Pull non-secret fields + toggles into state; secrets stay blank (override-only). */
function syncIntegrations(settings: Record<string, unknown>, s: IntegrationSetters) {
  const integ = settings.integrations as Record<string, any> | undefined;
  if (!integ || typeof integ !== 'object') return;

  if (integ.twilio) {
    const t = integ.twilio;
    s.setTwilio((prev) => ({ ...prev, fromNumber: t.fromNumber ?? prev.fromNumber, enabled: t.enabled !== false }));
    s.setTwilioMeta({
      accountSid: secretMeta(t.accountSidConfigured, t.accountSidSource, t.accountSid),
      authToken: secretMeta(t.authTokenConfigured, t.authTokenSource, t.authToken),
    });
  }
  if (integ.resend) {
    const r = integ.resend;
    s.setResend((prev) => ({
      ...prev,
      from: r.from ?? prev.from,
      quoteInbox: r.quoteInbox ?? prev.quoteInbox,
      enabled: r.enabled !== false,
    }));
    s.setResendMeta({ apiKey: secretMeta(r.apiKeyConfigured, r.apiKeySource, r.apiKey) });
  }
  if (integ.notifications) {
    s.setChannels({
      smsEnabled: integ.notifications.smsEnabled !== false,
      emailEnabled: integ.notifications.emailEnabled !== false,
    });
  }
}

/** Normalize a server secret field into display metadata. */
function secretMeta(configured: unknown, source: unknown, masked: unknown): IntegrationSecretField {
  const validSources: ServerSource[] = ['settings', 'environment', 'none'];
  const src = validSources.includes(source as ServerSource) ? (source as ServerSource) : 'none';
  return { configured: !!configured, source: src, masked: typeof masked === 'string' ? masked : '' };
}
