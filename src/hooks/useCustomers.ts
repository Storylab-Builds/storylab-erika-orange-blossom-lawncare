import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebounce } from './useDebounce';
import type { Customer } from '@/types';

interface UseCustomersOptions {
  search?: string;
  status?: Customer['status'] | Customer['status'][];
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const debouncedSearch = useDebounce(options.search ?? '', 300);
  const statusParam = typeof options.status === 'string' ? options.status : undefined;

  return useQuery<Customer[]>({
    queryKey: ['customers', debouncedSearch, options.status ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusParam) params.set('status', statusParam);
      const qs = params.toString();
      let result = await api.get<Customer[]>(`/customers${qs ? `?${qs}` : ''}`);
      if (Array.isArray(options.status) && options.status.length > 0) {
        const allowed = options.status;
        result = result.filter((c) => allowed.includes(c.status));
      }
      return result;
    },
    staleTime: 30 * 1000,
  });
}

export function useCustomer(customerId: string | null) {
  return useQuery<Customer>({
    queryKey: ['customer', customerId],
    queryFn: () => api.get<Customer>(`/customers/${customerId}`),
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Customer>) => api.post<Customer>('/customers', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Customer> & { id: string }) =>
      api.patch<Customer>(`/customers/${id}`, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer', vars.id] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<{ ok: boolean }>(`/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
