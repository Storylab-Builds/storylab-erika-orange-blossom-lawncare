// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';

// Deterministic, collision-free identifiers derived from the process id.
const pid = process.pid;
const tenantEmail = `tenant+${pid}@orangeblossom.com`;
const resetEmail = `reset+${pid}@orangeblossom.com`;

describe('Integrations + multi-tenant auth (real Postgres dev DB)', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@orangeblossom.com', password: 'Password123!' });
    token = res.body.token;
  });

  // --- Public quote form (email end-to-end) ---
  it('POST /api/public/quote (no auth) persists the lead and logs notification emails', async () => {
    const res = await request(app).post('/api/public/quote').send({
      name: `Quote Tester ${pid}`,
      email: `quotelead+${pid}@example.com`,
      phone: '+13305550100',
      serviceType: 'lawn-mowing',
      message: 'Weekly mowing please',
    });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.quoteId).toBeTruthy();
    // 'sent' if a live Resend key is configured, otherwise 'logged' (dev transport).
    expect(['sent', 'logged']).toContain(res.body.delivery);

    // The lead is queryable via the authed leads endpoint.
    const quotes = await request(app).get('/api/messages/quotes').set('Authorization', `Bearer ${token}`);
    expect(quotes.status).toBe(200);
    expect(quotes.body.some((q: { id: string }) => q.id === res.body.quoteId)).toBe(true);

    // Both the company + customer confirmation emails are in the message log.
    const log = await request(app).get('/api/messages?channel=email').set('Authorization', `Bearer ${token}`);
    expect(log.status).toBe(200);
    const related = log.body.filter((m: { relatedId: string }) => m.relatedId === res.body.quoteId);
    expect(related.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/public/quote rejects an invalid email (400)', async () => {
    const res = await request(app).post('/api/public/quote').send({ name: 'x', email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  // --- SMS service: logs to DB, validates without hitting Twilio for bad input ---
  it('POST /api/messages/test-sms with an invalid number fails + records a MessageLog row', async () => {
    const res = await request(app)
      .post('/api/messages/test-sms')
      .set('Authorization', `Bearer ${token}`)
      .send({ to: '12345', body: 'should not send' });
    expect(res.status).toBe(502);
    expect(res.body.success).toBe(false);
    expect(res.body.messageLogId).toBeTruthy();

    const log = await request(app)
      .get('/api/messages?channel=sms')
      .set('Authorization', `Bearer ${token}`);
    expect(log.body.some((m: { id: string }) => m.id === res.body.messageLogId)).toBe(true);
  });

  it('GET /api/messages without auth returns 401', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).toBe(401);
  });

  // --- Settings: integrations secrets masked + preserved-on-blank ---
  it('GET /api/settings masks integration secrets and never leaks the raw token', async () => {
    const res = await request(app).get('/api/settings').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const tw = res.body.integrations?.twilio;
    expect(tw).toBeTruthy();
    // masked preview, not the full 32-char token
    if (tw.authTokenConfigured) {
      expect(tw.authToken).toContain('•');
      expect(tw.authToken.length).toBeLessThan(20);
    }
  });

  it('PUT /api/settings/integrations with a blank secret preserves the existing value', async () => {
    const res = await request(app)
      .put('/api/settings/integrations')
      .set('Authorization', `Bearer ${token}`)
      .send({ value: { notifications: { smsEnabled: true, emailEnabled: true }, twilio: { authToken: '' } } });
    expect(res.status).toBe(200);
    // still configured (preserved from env/prior DB value)
    expect(res.body.value.twilio.authTokenConfigured === true || res.body.value.twilio.authTokenSource === 'environment').toBe(true);
  });

  // --- Multi-tenant registration ---
  it('POST /api/auth/register creates a second admin and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: tenantEmail, password: 'Admin12345', name: `Tenant ${pid}`, role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(tenantEmail);
    expect(res.body.token).toBeTruthy();

    // The new tenant can log in independently.
    const login = await request(app).post('/api/auth/login').send({ email: tenantEmail, password: 'Admin12345' });
    expect(login.status).toBe(200);
  });

  it('POST /api/auth/register rejects a duplicate email (409)', async () => {
    await request(app).post('/api/auth/register').send({ email: resetEmail, password: 'Admin12345', name: 'R', role: 'ADMIN' });
    const dup = await request(app).post('/api/auth/register').send({ email: resetEmail, password: 'Admin12345', name: 'R', role: 'ADMIN' });
    expect(dup.status).toBe(409);
  });

  // --- Password reset (forgot -> reset -> login with new password) ---
  it('full password-reset flow updates the password', async () => {
    // resetEmail user was created in the duplicate test above
    const forgot = await request(app).post('/api/auth/forgot-password').send({ email: resetEmail });
    expect(forgot.status).toBe(200);
    expect(forgot.body.devToken).toBeTruthy(); // dev transport exposes the token for testing

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.devToken, password: 'BrandNew123' });
    expect(reset.status).toBe(200);
    expect(reset.body.ok).toBe(true);

    const login = await request(app).post('/api/auth/login').send({ email: resetEmail, password: 'BrandNew123' });
    expect(login.status).toBe(200);

    // The token is single-use.
    const reuse = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.devToken, password: 'Another123' });
    expect(reuse.status).toBe(400);
  });

  it('forgot-password for an unknown email still returns 200 (no account enumeration)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: `nobody+${pid}@nowhere.com` });
    expect(res.status).toBe(200);
    expect(res.body.devToken).toBeFalsy();
  });
});
