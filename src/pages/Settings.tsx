import { useState } from 'react';
import {
  Building2,
  Scissors,
  CloudRain,
  Bell,
  Clock,
  Save,
  DollarSign,
  Thermometer,
  Droplets,
  Wind,
  Snowflake,
} from 'lucide-react';
import { SERVICE_TYPES, WEATHER_THRESHOLDS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const companyInfo = {
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

type NotificationTemplate = {
  name: string;
  channel: 'sms' | 'email' | 'both';
  active: boolean;
};

const notificationTemplates: NotificationTemplate[] = [
  { name: 'Service Reminder (24hr)', channel: 'sms', active: true },
  { name: 'Service Completed', channel: 'email', active: true },
  { name: 'Weather Reschedule', channel: 'both', active: true },
  { name: 'Invoice / Payment Due', channel: 'email', active: true },
  { name: 'Crew En Route', channel: 'sms', active: true },
  { name: 'Monthly Summary', channel: 'email', active: false },
  { name: 'Seasonal Promotion', channel: 'email', active: false },
];

const workingHours = {
  start: '7:00 AM',
  end: '5:00 PM',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  maxJobsPerCrew: 6,
  maxCrewsPerDay: 6,
  breakDuration: '30 min',
  travelBuffer: '15 min',
};

type SettingsTab = 'company' | 'services' | 'weather' | 'notifications' | 'hours';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [activeServices, setActiveServices] = useState<Set<string>>(
    () => new Set(serviceEntries.filter((s) => s.active).map((s) => s.key)),
  );

  const toggleService = (key: string) => {
    setActiveServices((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const tabs = [
    { key: 'company' as const, label: 'Company', icon: Building2 },
    { key: 'services' as const, label: 'Services & Pricing', icon: Scissors },
    { key: 'weather' as const, label: 'Weather Thresholds', icon: CloudRain },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    { key: 'hours' as const, label: 'Working Hours', icon: Clock },
  ];

  const weatherThresholdEntries = [
    { label: 'Cancel if rain probability above', value: String(WEATHER_THRESHOLDS.rain.cancelThreshold), unit: '%', icon: Droplets },
    { label: 'Delay if rain probability above', value: String(WEATHER_THRESHOLDS.rain.delayThreshold), unit: '%', icon: Droplets },
    { label: 'Cancel if wind speed above', value: String(WEATHER_THRESHOLDS.wind.cancelThreshold), unit: 'mph', icon: Wind },
    { label: 'Caution if temperature above', value: String(WEATHER_THRESHOLDS.heat.cautionThreshold), unit: '°F', icon: Thermometer },
    { label: 'Snow emergency threshold', value: String(WEATHER_THRESHOLDS.snow.emergencyThreshold), unit: 'in', icon: Snowflake },
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
                    ? 'bg-accent-light text-primary'
                    : 'text-slate-600 hover:bg-slate-50'
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
        {activeTab === 'company' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Company Profile</h3>
              <Button icon={<Save className="w-4 h-4" />}>Save Changes</Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(companyInfo).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    defaultValue={value}
                    aria-label={key.replace(/([A-Z])/g, ' $1').trim()}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'services' && (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Service Types & Pricing</h3>
              <Button>+ Add Service</Button>
            </div>
            <div className="space-y-3">
              {serviceEntries.map((svc) => {
                const isActive = activeServices.has(svc.key);
                return (
                  <div key={svc.key} className={`flex items-center gap-4 p-4 rounded-xl border ${isActive ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
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
                      <div className="w-9 h-5 bg-slate-200 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{svc.label}</p>
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
                <h3 className="text-lg font-semibold text-slate-900">Weather Thresholds</h3>
                <p className="text-sm text-slate-500 mt-1">Configure when weather conditions trigger automatic rescheduling</p>
              </div>
              <Button icon={<Save className="w-4 h-4" />}>Save</Button>
            </div>
            <div className="space-y-4">
              {weatherThresholdEntries.map((t, idx) => {
                const Icon = t.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <p className="flex-1 text-sm text-slate-700">{t.label}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={t.value}
                        aria-label={t.label}
                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <span className="text-sm text-slate-500 w-8">{t.unit}</span>
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
              <h3 className="text-lg font-semibold text-slate-900">Notification Templates</h3>
              <Button icon={<Save className="w-4 h-4" />}>Save</Button>
            </div>
            <div className="space-y-3">
              {notificationTemplates.map((tmpl, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                  <label className="relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      role="switch"
                      aria-checked={tmpl.active}
                      defaultChecked={tmpl.active}
                      className="sr-only peer"
                      aria-label={`Toggle ${tmpl.name}`}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-checked:bg-primary rounded-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{tmpl.name}</p>
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
              <h3 className="text-lg font-semibold text-slate-900">Working Hours & Capacity</h3>
              <Button icon={<Save className="w-4 h-4" />}>Save</Button>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Start Time</label>
                <input type="text" defaultValue={workingHours.start} aria-label="Start time" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">End Time</label>
                <input type="text" defaultValue={workingHours.end} aria-label="End time" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Max Jobs Per Crew</label>
                <input type="number" defaultValue={workingHours.maxJobsPerCrew} aria-label="Max jobs per crew" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Max Crews Per Day</label>
                <input type="number" defaultValue={workingHours.maxCrewsPerDay} aria-label="Max crews per day" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Break Duration</label>
                <input type="text" defaultValue={workingHours.breakDuration} aria-label="Break duration" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Travel Buffer</label>
                <input type="text" defaultValue={workingHours.travelBuffer} aria-label="Travel buffer" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const active = workingHours.days.includes(day);
                  return (
                    <button
                      key={day}
                      aria-label={`${day} ${active ? 'active' : 'inactive'}`}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 border border-slate-200'
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
