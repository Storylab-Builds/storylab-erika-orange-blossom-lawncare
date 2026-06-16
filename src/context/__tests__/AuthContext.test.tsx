import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const TOKEN_KEY = 'obs_token';

function mockResponse(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  return {
    status,
    ok: init.ok ?? (status >= 200 && status < 300),
    statusText: 'Error',
    json: async () => body,
  };
}

// Tiny consumer that exercises the AuthContext surface.
function Consumer() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{user ? user.email : 'anonymous'}</span>
      <button onClick={() => login('owner@obs.com', 'pw')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

const LOGGED_IN_USER = {
  id: 'u1',
  email: 'owner@obs.com',
  name: 'Owner',
  role: 'OWNER' as const,
};

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts anonymous when there is no stored token', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    // With no token the provider skips /auth/me and finishes loading.
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent('anonymous');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('login() stores the token and exposes the user', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ token: 'jwt-123', user: LOGGED_IN_USER }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('owner@obs.com'));
    expect(window.localStorage.getItem(TOKEN_KEY)).toBe('jwt-123');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/auth/login');
    expect(options.method).toBe('POST');
  });

  it('logout() clears the user and the stored token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ token: 'jwt-123', user: LOGGED_IN_USER }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));

    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('owner@obs.com'));

    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('anonymous'));
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
