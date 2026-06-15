import React from 'react';
import { MessageSquare, AlertTriangle, Cloud, Check, CheckCheck, Eye } from 'lucide-react';

export type NotificationType = 'message' | 'alert' | 'weather';
export type DeliveryStatus = 'sent' | 'delivered' | 'read';

export interface NotificationItemProps {
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  deliveryStatus: DeliveryStatus;
  className?: string;
}

const typeIcon: Record<NotificationType, React.ReactNode> = {
  message: <MessageSquare className="w-4 h-4 text-primary" />,
  alert: <AlertTriangle className="w-4 h-4 text-warning" />,
  weather: <Cloud className="w-4 h-4 text-blue-400" />,
};

const statusIcon: Record<DeliveryStatus, React.ReactNode> = {
  sent: <Check className="w-3.5 h-3.5 text-gray-400" />,
  delivered: <CheckCheck className="w-3.5 h-3.5 text-gray-400" />,
  read: <Eye className="w-3.5 h-3.5 text-success" />,
};

const statusLabel: Record<DeliveryStatus, string> = {
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
};

function NotificationItem({
  type,
  title,
  body,
  timestamp,
  deliveryStatus,
  className,
}: NotificationItemProps) {
  return (
    <div className={`flex items-start gap-3 py-3 ${className ?? ''}`}>
      <div className="mt-0.5 w-8 h-8 rounded-full bg-accent-light flex items-center justify-center shrink-0">
        {typeIcon[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{title}</h4>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{timestamp}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{body}</p>
        <div className="flex items-center gap-1 mt-1.5">
          {statusIcon[deliveryStatus]}
          <span className="text-xs text-gray-400">{statusLabel[deliveryStatus]}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NotificationItem);
