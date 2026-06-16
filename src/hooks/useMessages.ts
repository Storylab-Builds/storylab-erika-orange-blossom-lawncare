import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface MessageLog {
  id: string;
  channel: 'sms' | 'email';
  direction: string;
  toAddress: string;
  fromAddress: string;
  subject: string | null;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'logged';
  provider: string | null;
  providerId: string | null;
  error: string | null;
  relatedType: string | null;
  relatedId: string | null;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  serviceType: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  createdAt: string;
}

export function useMessages(channel?: 'sms' | 'email') {
  const qs = channel ? `?channel=${channel}` : '';
  return useQuery<MessageLog[]>({
    queryKey: ['messages', channel ?? 'all'],
    queryFn: () => api.get<MessageLog[]>(`/messages${qs}`),
    staleTime: 15 * 1000,
  });
}

export interface TestSmsResult {
  success: boolean;
  status: 'sent' | 'failed' | 'logged';
  provider: 'twilio' | 'dev-log';
  messageLogId: string;
  providerId?: string;
  error?: string;
}

export function useSendTestSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ to, body }: { to: string; body?: string }) =>
      api.post<TestSmsResult>('/messages/test-sms', { to, body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useQuotes() {
  return useQuery<QuoteRequest[]>({
    queryKey: ['quotes'],
    queryFn: () => api.get<QuoteRequest[]>('/messages/quotes'),
    staleTime: 30 * 1000,
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteRequest['status'] }) =>
      api.patch<QuoteRequest>(`/messages/quotes/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}
