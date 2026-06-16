import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Notification } from '@/types';

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get<Notification[]>('/notifications'),
    staleTime: 30 * 1000,
  });
}

export interface SendNotificationInput {
  customerId: string;
  customerName: string;
  channel: 'sms' | 'email' | 'push';
  message: string;
  type?: string;
}

export function useSendNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendNotificationInput) => api.post<Notification>('/notifications', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
