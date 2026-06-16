// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';

// Unique-but-deterministic email per process so repeated runs never collide
// with each other or with seed data. Derived from the test process id, not
// a random/time call.
const uniqueEmail = `itest+${process.pid}@x.com`;

describe('API integration (real Postgres dev DB)', () => {
  let token: string;
  const createdCustomerIds: string[] = [];

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@orangeblossom.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    token = res.body.token;
  });

  it('(a) POST /api/auth/login returns 200 + token for the seed owner', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@orangeblossom.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user?.email).toBe('owner@orangeblossom.com');
  });

  it('(b) GET /api/customers without auth returns 401', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
  });

  it('(c) GET /api/customers with Bearer token returns 200 and an array', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('(d) POST then DELETE /api/customers round-trips and cleans up', async () => {
    const createRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Integration Test ${process.pid}`,
        email: uniqueEmail,
        phone: '555-0100',
        address: '1 Test Way',
        city: 'Orlando',
        state: 'FL',
        zip: '32801',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeTruthy();
    const id = createRes.body.id as string;
    createdCustomerIds.push(id);

    const deleteRes = await request(app)
      .delete(`/api/customers/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.ok).toBe(true);
    // Successfully deleted -> drop from cleanup list
    createdCustomerIds.length = 0;
  });
});
