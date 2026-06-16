import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import JobFormModal from '../JobFormModal';

// --- Minimal fixtures matching the hook data shapes ---
const customers = [
  {
    id: 'c1',
    name: 'Jane Homeowner',
    email: 'jane@example.com',
    phone: '555-0100',
    address: '12 Maple St',
    city: 'Orlando',
    state: 'FL',
    zip: '32801',
    status: 'active',
    properties: [{ id: 'p1', customerId: 'c1', address: '12 Maple St', lotSize: 5000, features: [], services: [] }],
    notes: '',
    preferredContact: 'email',
    createdAt: new Date().toISOString(),
  },
];

const crews = [
  {
    id: 'crew1',
    name: 'Alpha Crew',
    members: [],
    specialties: ['mowing'],
    equipment: [],
    status: 'available',
    serviceZone: 'North',
    todayJobsCount: 0,
    todayJobsCompleted: 0,
    efficiency: 95,
  },
];

function jsonResponse(body: unknown) {
  return {
    status: 200,
    ok: true,
    statusText: 'OK',
    json: async () => body,
  };
}

// Route mocked fetch calls by the requested /api path.
function makeFetchMock() {
  return vi.fn((url: string) => {
    if (url.startsWith('/api/customers')) return Promise.resolve(jsonResponse(customers));
    if (url.startsWith('/api/crews')) return Promise.resolve(jsonResponse(crews));
    if (url.startsWith('/api/jobs')) return Promise.resolve(jsonResponse([]));
    return Promise.resolve(jsonResponse([]));
  });
}

function renderModal() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <JobFormModal isOpen onClose={() => {}} defaultDate="2026-06-16" />
    </QueryClientProvider>,
  );
}

describe('JobFormModal', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', makeFetchMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the Customer, Service Type, and Crew fields', async () => {
    renderModal();
    expect(await screen.findByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Service Type')).toBeInTheDocument();
    expect(screen.getByText('Crew')).toBeInTheDocument();
  });

  it('renders the Create Job submit button', async () => {
    renderModal();
    expect(await screen.findByRole('button', { name: /create job/i })).toBeInTheDocument();
  });

  it('populates the Customer select with fetched customers', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Jane Homeowner')).toBeInTheDocument();
    });
  });
});
