import { useQuery } from '@tanstack/react-query';
import { customers } from '@/data/mockData';
import { useDebounce } from './useDebounce';
import type { Customer } from '@/types';

interface UseCustomersOptions {
  search?: string;
  status?: Customer['status'] | Customer['status'][];
}

/**
 * Simulates fetching customers with search and status filters.
 */
async function fetchCustomers(options: UseCustomersOptions): Promise<Customer[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...customers];

  if (options.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    filtered = filtered.filter((c) => statuses.includes(c.status));
  }

  if (options.search && options.search.trim().length > 0) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q),
    );
  }

  return filtered;
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const debouncedSearch = useDebounce(options.search ?? '', 300);

  return useQuery<Customer[]>({
    queryKey: ['customers', { ...options, search: debouncedSearch }],
    queryFn: () => fetchCustomers({ ...options, search: debouncedSearch }),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for a single customer by ID.
 */
export function useCustomer(customerId: string | null) {
  return useQuery<Customer | null>({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      await new Promise((resolve) => setTimeout(resolve, 100));
      return customers.find((c) => c.id === customerId) ?? null;
    },
    enabled: !!customerId,
  });
}
