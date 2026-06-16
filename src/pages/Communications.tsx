import { useState } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  Clock,
  CheckCircle2,
  Eye,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react';
import { useNotifications, useSendNotification, useCustomers } from '@/hooks';
import { getRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/LoadingSpinner';

function getStatusIcon(status: Notification['status']): { Icon: typeof CheckCircle2; color: string } {
  switch (status) {
    case 'delivered': return { Icon: Send, color: 'text-primary' };
    case 'read': return { Icon: Eye, color: 'text-success' };
    case 'failed': return { Icon: AlertCircle, color: 'text-error' };
    case 'pending': return { Icon: Clock, color: 'text-warning' };
    case 'sent': return { Icon: Send, color: 'text-primary' };
    default: return { Icon: Clock, color: 'text-slate-400' };
  }
}

type TabKey = 'recent' | 'byType' | 'byStatus';

interface ComposeForm {
  customerId: string;
  channel: 'sms' | 'email';
  message: string;
}

const EMPTY_COMPOSE: ComposeForm = { customerId: '', channel: 'sms', message: '' };

export default function Communications() {
  // All hooks must run before any early return (Rules of Hooks).
  const [activeTab, setActiveTab] = useState<TabKey>('recent');
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState<ComposeForm>(EMPTY_COMPOSE);
  const { data, isLoading, isError } = useNotifications();
  const { data: customersData } = useCustomers();
  const sendNotification = useSendNotification();
  const notifications = data ?? [];
  const customers = customersData ?? [];

  function openCompose() {
    setForm(EMPTY_COMPOSE);
    sendNotification.reset();
    setShowCompose(true);
  }

  function updateField<K extends keyof ComposeForm>(key: K, value: ComposeForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const customer = customers.find((c) => c.id === form.customerId);
    if (!customer || !form.message.trim()) return;
    sendNotification.mutate(
      {
        customerId: customer.id,
        customerName: customer.name,
        channel: form.channel,
        message: form.message.trim(),
        type: 'reminder',
      },
      {
        onSuccess: () => {
          setShowCompose(false);
          setForm(EMPTY_COMPOSE);
        },
      },
    );
  }

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading communications..." />;
  }

  const sentToday = notifications.filter((n) => {
    const sentDate = new Date(n.sentAt);
    const today = new Date();
    return sentDate.toDateString() === today.toDateString();
  }).length;
  const readCount = notifications.filter((n) => n.status === 'read').length;
  const failedCount = notifications.filter((n) => n.status === 'failed').length;
  const pendingCount = notifications.filter((n) => n.status === 'pending' || n.status === 'sent').length;

  const readRate = notifications.length > 0
    ? Math.round((readCount / notifications.length) * 100)
    : 0;

  const tabs = [
    { key: 'recent' as const, label: 'Recent', icon: MessageSquare, count: notifications.length },
    { key: 'byType' as const, label: 'By Type', icon: FileText, count: new Set(notifications.map(n => n.type)).size },
    { key: 'byStatus' as const, label: 'By Status', icon: Clock, count: new Set(notifications.map(n => n.status)).size },
  ];

  // Group by type for "byType" tab
  const groupedByType = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    acc[n.type] = acc[n.type] ?? [];
    acc[n.type].push(n);
    return acc;
  }, {});

  // Group by status for "byStatus" tab
  const groupedByStatus = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    acc[n.status] = acc[n.status] ?? [];
    acc[n.status].push(n);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Communications</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Customer notifications and message history</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCompose}>
          New Message
        </Button>
      </div>

      {isError && (
        <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 p-3 text-sm text-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Couldn&apos;t load notifications. Please try again.</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-slate-500 dark:text-gray-400">Total Messages</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{notifications.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-gray-400">Read Rate</p>
          <p className="text-2xl font-bold text-success mt-1">{readRate}%</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-gray-400">Pending/Sent</p>
          <p className="text-2xl font-bold text-primary mt-1">{pendingCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-gray-400">Failed</p>
          <p className="text-2xl font-bold text-error mt-1">{failedCount}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl shadow-card border border-slate-100 dark:border-gray-700 p-1" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'recent' && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-gray-500 py-8 text-center">No notifications yet.</p>
            ) : (
              notifications.map((n) => {
              const { Icon: StatusIcon, color } = getStatusIcon(n.status);
              return (
                <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${n.channel === 'sms' ? 'bg-success/10' : 'bg-primary/10'}`}>
                    {n.channel === 'sms' ? <Phone className="w-4 h-4 text-success" /> : <Mail className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{n.customerName}</p>
                      <span className="text-xs text-slate-400 dark:text-gray-500 uppercase">{n.channel}</span>
                      <Badge variant={n.type === 'weather' ? 'warning' : n.type === 'completion' ? 'success' : 'info'}>
                        {n.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${color}`} />
                    <span className={`text-xs font-medium capitalize ${color}`}>{n.status}</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-gray-500">{getRelativeTime(n.sentAt)}</span>
                </div>
              );
              })
            )}
          </div>
        </Card>
      )}

      {activeTab === 'byType' && (
        <div className="space-y-4">
          {Object.entries(groupedByType).map(([type, items]) => (
            <Card key={type} padding="lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{type.replace('-', ' ')} Notifications</h3>
                <Badge variant="info">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-slate-700 dark:text-gray-300">{n.customerName}</span>
                    <span className="text-slate-400 dark:text-gray-500 truncate flex-1">{n.message.slice(0, 60)}...</span>
                    <span className="text-xs text-slate-400 dark:text-gray-500">{getRelativeTime(n.sentAt)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'byStatus' && (
        <div className="space-y-4">
          {Object.entries(groupedByStatus).map(([status, items]) => {
            const { Icon: StatusIcon, color } = getStatusIcon(status as Notification['status']);
            return (
              <Card key={status} padding="lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${color}`} />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{status}</h3>
                  </div>
                  <Badge variant={status === 'failed' ? 'error' : status === 'read' || status === 'delivered' ? 'success' : 'warning'}>
                    {items.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 5).map((n) => (
                    <div key={n.id} className="flex items-center gap-3 text-sm">
                      <span className="font-medium text-slate-700 dark:text-gray-300">{n.customerName}</span>
                      <span className="text-xs text-slate-400 dark:text-gray-500 uppercase">{n.channel}</span>
                      <span className="text-slate-400 dark:text-gray-500 truncate flex-1">{n.message.slice(0, 60)}...</span>
                      <span className="text-xs text-slate-400 dark:text-gray-500">{getRelativeTime(n.sentAt)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Compose Modal */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="New Message" size="md">
        <form onSubmit={handleSend} className="space-y-4">
          <Select
            label="Customer"
            placeholder="Select a customer"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            value={form.customerId}
            onChange={(value) => updateField('customerId', value)}
          />
          <Select
            label="Channel"
            options={[
              { value: 'sms', label: 'SMS' },
              { value: 'email', label: 'Email' },
            ]}
            value={form.channel}
            onChange={(value) => updateField('channel', value as ComposeForm['channel'])}
          />
          <div className="w-full">
            <label
              htmlFor="compose-message"
              className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5"
            >
              Message
            </label>
            <textarea
              id="compose-message"
              rows={4}
              value={form.message}
              onChange={(e) => updateField('message', e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            />
          </div>

          {sendNotification.isError && (
            <p className="text-sm text-error">
              {(sendNotification.error as Error)?.message ?? 'Failed to send message. Please try again.'}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCompose(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Send className="w-4 h-4" />}
              loading={sendNotification.isPending}
              disabled={!form.customerId || !form.message.trim()}
            >
              Send Message
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
