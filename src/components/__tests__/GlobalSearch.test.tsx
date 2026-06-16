import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import GlobalSearch from '../GlobalSearch';

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
    properties: [],
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

const jobs: unknown[] = [];

function jsonResponse(body: unknown) {
  return {
    status: 200,
    ok: true,
    statusText: 'OK',
    json: async () => body,
  };
}

function makeFetchMock() {
  return vi.fn((url: string) => {
    if (url.startsWith('/api/customers')) return Promise.resolve(jsonResponse(customers));
    if (url.startsWith('/api/crews')) return Promise.resolve(jsonResponse(crews));
    if (url.startsWith('/api/jobs')) return Promise.resolve(jsonResponse(jobs));
    return Promise.resolve(jsonResponse([]));
  });
}

function renderSearch() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <GlobalSearch isOpen onClose={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('GlobalSearch', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('fetch', makeFetchMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the search input when open', async () => {
    renderSearch();
    expect(await screen.findByPlaceholderText(/search customers, crews, jobs/i)).toBeInTheDocument();
  });

  it('shows a matching result after typing a query', async () => {
    renderSearch();

    const input = await screen.findByPlaceholderText(/search customers, crews, jobs/i);
    fireEvent.change(input, { target: { value: 'Jane' } });

    expect(await screen.findByText('Jane Homeowner')).toBeInTheDocument();
  });

  it('shows a no-results message for a non-matching query', async () => {
    renderSearch();

    const input = await screen.findByPlaceholderText(/search customers, crews, jobs/i);
    fireEvent.change(input, { target: { value: 'zzznotfound' } });

    await waitFor(() => {
      expect(screen.getByText(/no results for/i)).toBeInTheDocument();
    });
  });
});
