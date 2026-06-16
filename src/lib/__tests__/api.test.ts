import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiError, getToken, setToken } from '../api';

const TOKEN_KEY = 'obs_token';

// Build a minimal Response-like object good enough for the api wrapper.
function mockResponse(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  return {
    status,
    ok: init.ok ?? (status >= 200 && status < 300),
    statusText: 'Error',
    json: async () => body,
  };
}

describe('getToken / setToken', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips a token through localStorage', () => {
    expect(getToken()).toBeNull();
    setToken('abc123');
    expect(window.localStorage.getItem(TOKEN_KEY)).toBe('abc123');
    expect(getToken()).toBe('abc123');
  });

  it('removes the token when set to null', () => {
    setToken('abc123');
    setToken(null);
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(getToken()).toBeNull();
  });
});

describe('api.request', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('attaches the Authorization header when a token is set', async () => {
    setToken('my-jwt');
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await api.get('/jobs');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/jobs');
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my-jwt');
  });

  it('does not attach Authorization when no token is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await api.get('/jobs');

    const [, options] = fetchMock.mock.calls[0];
    expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('sets Content-Type when a body is sent', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await api.post('/jobs', { name: 'Mow' });

    const [, options] = fetchMock.mock.calls[0];
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(options.body).toBe(JSON.stringify({ name: 'Mow' }));
  });

  it('throws ApiError with the server-provided error message on a non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ error: 'Job not found' }, { status: 404 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.get('/jobs/999')).rejects.toThrowError(ApiError);
    await expect(api.get('/jobs/999')).rejects.toThrowError('Job not found');

    try {
      await api.get('/jobs/999');
      throw new Error('expected api.get to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });

  it('clears the stored token on a 401 response', async () => {
    setToken('expired-jwt');
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({ error: 'Unauthorized' }, { status: 401 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.get('/auth/me')).rejects.toThrowError(ApiError);
    expect(getToken()).toBeNull();
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('returns undefined for a 204 No Content response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.del('/jobs/1');
    expect(result).toBeUndefined();
  });
});
