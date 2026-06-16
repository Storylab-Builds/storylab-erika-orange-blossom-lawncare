import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Home,
  Ruler,
  KeyRound,
  TreePine,
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  StickyNote,
  Edit,
  Send,
} from 'lucide-react';
import { useCustomer } from '@/hooks';
import { formatCurrency, formatDate, getServiceColor, getRelativeTime } from '@/lib/utils';
import { SERVICE_TYPES } from '@/lib/constants';
import { notifications } from '@/data/mockData';
import type { Customer, ServiceAgreement, Notification } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

function getStatusBadgeVariant(status: Customer['status']): 'success' | 'neutral' | 'warning' {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'neutral';
    case 'prospect': return 'warning';
    default: return 'neutral';
  }
}

function getServiceLabel(type: ServiceAgreement['serviceType']): string {
  return SERVICE_TYPES[type]?.label ?? type;
}

const MESSAGE_TEMPLATES: { value: string; label: string; body: string }[] = [
  { value: '', label: 'Custom message', body: '' },
  { value: 'schedule-reminder', label: 'Schedule Reminder', body: 'This is a reminder that your next service is scheduled for this week. Please ensure access to the property.' },
  { value: 'service-complete', label: 'Service Completed', body: 'Your lawn service has been completed today. Thank you for choosing Orange Blossom Special Lawncare!' },
  { value: 'weather-delay', label: 'Weather Delay', body: 'Due to weather conditions, your scheduled service has been delayed. We will reschedule at the earliest opportunity.' },
  { value: 'invoice', label: 'Invoice / Payment', body: 'Your invoice is ready. Please review and submit payment at your convenience. Thank you!' },
  { value: 'seasonal', label: 'Seasonal Update', body: 'As the season changes, we wanted to reach out about adjusting your service plan. Let us know if you\'d like to discuss options.' },
];

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, isError } = useCustomer(id ?? null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageChannel, setMessageChannel] = useState<'sms' | 'email'>('sms');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [sentMessages, setSentMessages] = useState<Array<{ id: string; channel: 'sms' | 'email'; subject: string; body: string; sentAt: string }>>([]);
  const [sending, setSending] = useState(false);

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading customer..." />;
  }

  if (isError || !customer) {
    return (
      <div className="space-y-6">
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <div className="text-center py-12">
          <p className="text-lg font-medium text-slate-700">Customer not found</p>
          <p className="text-sm text-slate-500 mt-1">The customer you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const property = customer.properties[0];
  const lotDisplay = property
    ? property.lotSize >= 43560
      ? `${(property.lotSize / 43560).toFixed(1)} acres`
      : `${property.lotSize.toLocaleString()} sqft`
    : 'N/A';

  const customerNotifications = notifications.filter((n) => n.customerId === customer.id);

  function handleTemplateChange(value: string) {
    setMessageTemplate(value);
    const tpl = MESSAGE_TEMPLATES.find((t) => t.value === value);
    if (tpl) {
      setMessageBody(tpl.body);
      if (value) {
        setMessageSubject(tpl.label);
      }
    }
  }

  function openMessageModal() {
    if (!customer) return;
    setMessageChannel(customer.preferredContact === 'email' ? 'email' : 'sms');
    setMessageSubject('');
    setMessageBody('');
    setMessageTemplate('');
    setShowMessageModal(true);
  }

  function handleSendMessage() {
    if (!messageBody.trim()) return;
    setSending(true);
    // Simulate send delay
    setTimeout(() => {
      setSentMessages((prev) => [
        {
          id: `msg-${Date.now()}`,
          channel: messageChannel,
          subject: messageSubject,
          body: messageBody,
          sentAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSending(false);
      setShowMessageModal(false);
    }, 800);
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      {/* Customer Header */}
      <Card padding="lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
              <Badge variant={getStatusBadgeVariant(customer.status)}>
                {customer.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {customer.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {customer.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {customer.address}, {customer.city}, {customer.state} {customer.zip}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" icon={<Send className="w-4 h-4" />} onClick={openMessageModal}>
              Send Message
            </Button>
            <Button variant="outline" icon={<Edit className="w-4 h-4" />}>
              Edit
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          {property && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Size</p>
                    <p className="text-sm font-medium text-slate-900">{lotDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium text-slate-900">{customer.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Gate Code</p>
                    <p className="text-sm font-medium text-slate-900">{property.gateCode ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Features</p>
                    <p className="text-sm font-medium text-slate-900">{property.features.length} noted</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {property.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {f}
                  </div>
                ))}
              </div>
              {property.accessInstructions && (
                <div className="mt-4 p-3 rounded-xl bg-warning/5 border border-warning/20">
                  <p className="text-xs font-medium text-warning mb-1">Access Notes</p>
                  <p className="text-sm text-slate-600">{property.accessInstructions}</p>
                </div>
              )}
            </Card>
          )}

          {/* Notes */}
          {customer.notes && (
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Notes</h3>
              <div className="flex items-start gap-2">
                <StickyNote className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600">{customer.notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Services */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Active Services</h3>
            <div className="space-y-3">
              {property?.services
                .filter((s) => s.status === 'active')
                .map((svc) => (
                  <div key={svc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getServiceColor(svc.serviceType)}`}>
                          {getServiceLabel(svc.serviceType)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{formatCurrency(svc.price)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.frequency}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {svc.estimatedDuration} min</span>
                    </div>
                    {svc.nextScheduledDate && (
                      <p className="text-xs text-slate-400 mt-1">Next: {formatDate(svc.nextScheduledDate)}</p>
                    )}
                  </div>
                )) ?? (
                <p className="text-sm text-slate-400">No active services</p>
              )}
            </div>
          </Card>

          {/* Customer Info */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Preferred: {customer.preferredContact}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                Customer since: {formatDate(customer.createdAt)}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Communication History */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Communication History</h3>
          <Button variant="outline" size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={openMessageModal}>
            New Message
          </Button>
        </div>

        {/* Manually sent messages */}
        {sentMessages.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Sent from this session</p>
            <div className="space-y-2">
              {sentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.channel === 'sms' ? 'bg-success/10' : 'bg-primary/10'}`}>
                    {msg.channel === 'sms' ? <Phone className="w-4 h-4 text-success" /> : <Mail className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 uppercase font-medium">{msg.channel}</span>
                      {msg.subject && <span className="text-sm font-medium text-slate-700">{msg.subject}</span>}
                      <Badge variant="success">sent</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{msg.body}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{getRelativeTime(msg.sentAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing notification history */}
        {customerNotifications.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Automated notifications</p>
            {customerNotifications.map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.channel === 'sms' ? 'bg-success/10' : 'bg-primary/10'}`}>
                  {n.channel === 'sms' ? <Phone className="w-4 h-4 text-success" /> : <Mail className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase font-medium">{n.channel}</span>
                    <Badge variant={n.type === 'weather' ? 'warning' : n.type === 'completion' ? 'success' : 'info'}>
                      {n.type}
                    </Badge>
                    <Badge variant={n.status === 'read' || n.status === 'delivered' ? 'success' : n.status === 'failed' ? 'error' : 'neutral'}>
                      {n.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{getRelativeTime(n.sentAt)}</span>
              </div>
            ))}
          </div>
        ) : sentMessages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No communications yet. Send the first message to this customer.</p>
        ) : null}
      </Card>

      {/* Send Message Modal */}
      <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title="Send Message" size="md">
        <div className="space-y-4">
          {/* Recipient info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-sm font-medium text-slate-900">{customer.name}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>
            </div>
          </div>

          {/* Channel selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Channel</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMessageChannel('sms')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  messageChannel === 'sms'
                    ? 'bg-success/10 border-success/30 text-success'
                    : 'bg-white border-gray-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Phone className="w-4 h-4" />
                SMS
              </button>
              <button
                type="button"
                onClick={() => setMessageChannel('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  messageChannel === 'email'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-white border-gray-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </div>

          {/* Template selector */}
          <Select
            label="Template"
            options={MESSAGE_TEMPLATES.map((t) => ({ value: t.value, label: t.label }))}
            value={messageTemplate}
            onChange={handleTemplateChange}
            placeholder="Choose a template or write custom"
          />

          {/* Subject (for email) */}
          {messageChannel === 'email' && (
            <Input
              label="Subject"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              placeholder="Email subject line"
            />
          )}

          {/* Message body */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={4}
              placeholder={messageChannel === 'sms' ? 'Type your SMS message...' : 'Type your email message...'}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-gray-400 transition-colors duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            />
            {messageChannel === 'sms' && (
              <p className="mt-1 text-xs text-slate-400">{messageBody.length}/160 characters</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowMessageModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Send className="w-4 h-4" />}
              onClick={handleSendMessage}
              loading={sending}
              disabled={!messageBody.trim()}
            >
              Send {messageChannel === 'sms' ? 'SMS' : 'Email'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
