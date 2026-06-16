// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { signToken, requireRole, type AuthUser } from '../middleware/auth';
import { env } from '../env';
import { ApiError } from '../lib/http';

const BASE_USER: AuthUser = {
  id: 'u1',
  email: 'owner@obs.com',
  name: 'Owner',
  role: 'OWNER',
};

describe('signToken + jwt.verify', () => {
  it('round-trips the user claims through a signed JWT', () => {
    const token = signToken(BASE_USER);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & AuthUser;
    expect(decoded.id).toBe(BASE_USER.id);
    expect(decoded.email).toBe(BASE_USER.email);
    expect(decoded.name).toBe(BASE_USER.name);
    expect(decoded.role).toBe(BASE_USER.role);
  });

  it('produces a token that fails verification with the wrong secret', () => {
    const token = signToken(BASE_USER);
    expect(() => jwt.verify(token, 'a-different-secret')).toThrow();
  });
});

describe('requireRole', () => {
  function makeCtx(user?: AuthUser) {
    const req = { user } as { user?: AuthUser };
    const res = {} as Record<string, unknown>;
    const next = vi.fn();
    return { req, res, next };
  }

  it('calls next() when the user holds an allowed role', () => {
    const middleware = requireRole('OWNER', 'ADMIN');
    const { req, res, next } = makeCtx(BASE_USER);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware(req as any, res as any, next as any);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('throws ApiError(403) for a disallowed role', () => {
    const middleware = requireRole('OWNER', 'ADMIN');
    const { req, res, next } = makeCtx({ ...BASE_USER, role: 'CREW' });

    let thrown: unknown;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      middleware(req as any, res as any, next as any);
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('throws ApiError(401) when no user is attached to the request', () => {
    const middleware = requireRole('OWNER');
    const { req, res, next } = makeCtx(undefined);

    let thrown: unknown;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      middleware(req as any, res as any, next as any);
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('bcryptjs hash/compare', () => {
  it('hashes a password and verifies it with compare', async () => {
    const password = 'super-secret-pw';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare('wrong-password', hash)).toBe(false);
  });

  it('works with the synchronous API as well', () => {
    const hash = bcrypt.hashSync('pw123', 10);
    expect(bcrypt.compareSync('pw123', hash)).toBe(true);
    expect(bcrypt.compareSync('nope', hash)).toBe(false);
  });
});
