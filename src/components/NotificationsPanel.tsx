import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Mail, Bell, CheckCheck, X, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { useMessages, type MessageLog } from '@/hooks/useMessages';
import Badge, { type BadgeProps } from '@/components/ui/Badge';
import type { Notification } from '@/types';

export interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

type FeedChannel = 'sms' | 'email' | 'push';
type FeedStatus = Notification['status'] | MessageLog['status'];

interface FeedItem {
  id: string;
  channel: FeedChannel;
  title: string;
  snippet: string;
  status: FeedStatus;
  at: string;
}

const MAX_ITEMS = 30;

const channelIcons: Record<FeedChannel, React.ComponentType<{ className?: string }>> = {
  sms: MessageSquare,
  email: Mail,
  push: Bell,
};

function badgeVariant(status: FeedStatus): BadgeProps['variant'] {
  if (status === 'sent' || status === 'delivered' || status === 'read') return 'success';
  if (status === 'failed') return 'error';
  return 'neutral';
}

function mapMessage(m: MessageLog): FeedItem {
  return {
    id: `msg-${m.id}`,
    channel: m.channel,
    title: m.toAddress,
    snippet: m.subject ? `${m.subject} — ${m.body}` : m.body,
    status: m.status,
    at: m.createdAt,
  };
}

function mapNotification(n: Notification): FeedItem {
  return {
    id: `ntf-${n.id}`,
    channel: n.channel,
    title: n.customerName || 'Notification',
    snippet: n.message,
    status: n.status,
    at: n.sentAt,
  };
}

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

function buildFeed(notifications?: Notification[], messages?: MessageLog[]): FeedItem[] {
  const merged = [
    ...(notifications ?? []).map(mapNotification),
    ...(messages ?? []).map(mapMessage),
  ];
  return merged
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, MAX_ITEMS);
}

function FeedRow({ item }: { item: FeedItem }) {
  const Icon = channelIcons[item.channel] ?? Bell;
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-gray-700/60 transition-colors">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</span>
          <span className="text-xs text-slate-400 dark:text-gray-500 flex-shrink-0">{relativeTime(item.at)}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 mt-0.5">{item.snippet}</p>
        <Badge variant={badgeVariant(item.status)} size="sm" className="mt-1.5 uppercase tracking-wide">
          {item.status}
        </Badge>
      </div>
    </div>
  );
}

export default function NotificationsPanel({ isOpen, onClose, onMarkAllRead }: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useNotifications();
  const { data: messages } = useMessages();

  const items = useMemo<FeedItem[]>(
    () => buildFeed(notifications, messages),
    [notifications, messages],
  );

  // Escape closes the panel. All hooks run before any return (Rules of Hooks).
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent backdrop closes the dropdown on outside click. */}
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={onClose} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 max-h-[70vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto py-1">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
                  <p className="text-sm text-slate-500 dark:text-gray-500">No notifications yet</p>
                </div>
              ) : (
                items.map((item) => <FeedRow key={item.id} item={item} />)
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
