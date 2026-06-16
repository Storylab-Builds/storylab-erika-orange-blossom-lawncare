// @vitest-environment node
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('Calendar ICS feed (Google Calendar integration)', () => {
  it('rejects the feed without the correct token (401)', async () => {
    const res = await request(app).get('/api/calendar/jobs.ics');
    expect(res.status).toBe(401);
  });

  it('serves a valid iCalendar feed of jobs with the token', async () => {
    const res = await request(app).get('/api/calendar/jobs.ics?token=obs-dev-feed');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/calendar');
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('END:VCALENDAR');
    expect(res.text).toContain('BEGIN:VEVENT');
    expect(res.text).toMatch(/DTSTART:\d{8}T\d{6}/);
    expect(res.text).toMatch(/SUMMARY:.+/);
  });

  it('exposes feed info for the UI', async () => {
    const res = await request(app).get('/api/calendar/feed-info');
    expect(res.status).toBe(200);
    expect(res.body.path).toBe('/api/calendar/jobs.ics');
    expect(res.body.token).toBeTruthy();
  });
});
