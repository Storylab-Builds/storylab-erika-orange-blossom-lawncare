import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler, ApiError } from '../lib/http';

const router = Router();

// Token that gates the public ICS feed (Google fetches it server-side with no
// auth headers, so the secret lives in the URL). Override via env in prod.
const FEED_TOKEN = process.env.CALENDAR_FEED_TOKEN || 'obs-dev-feed';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// "2026-06-16" + "07:00" -> "20260616T070000" (floating local time).
function toIcsDateTime(date: string, time: string): string {
  const [y, m, d] = date.split('-');
  const [hh, mm] = (time || '00:00').split(':');
  return `${y}${m}${d}T${pad(Number(hh))}${pad(Number(mm))}00`;
}

function icsEscape(s: string): string {
  return (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildIcs(jobs: Awaited<ReturnType<typeof prisma.job.findMany>>): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Orange Blossom Lawncare//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Orange Blossom Jobs',
    'X-WR-TIMEZONE:America/New_York',
  ];
  for (const j of jobs) {
    const summary = `${j.serviceType} — ${j.customerName}`;
    const desc = [
      `Service: ${j.serviceType}`,
      `Crew: ${j.crewName}`,
      `Status: ${j.status}`,
      j.notes ? `Notes: ${j.notes}` : '',
    ].filter(Boolean).join('\\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${j.id}@orangeblossom`,
      `DTSTAMP:${toIcsDateTime(j.scheduledDate, j.startTime)}`,
      `DTSTART:${toIcsDateTime(j.scheduledDate, j.startTime)}`,
      `DTEND:${toIcsDateTime(j.scheduledDate, j.endTime || j.startTime)}`,
      `SUMMARY:${icsEscape(summary)}`,
      `LOCATION:${icsEscape(j.propertyAddress)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      `STATUS:${j.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Subscribable iCalendar feed of all jobs. Add it in Google Calendar via
// "Other calendars -> From URL". Token-gated (?token=...).
router.get(
  '/jobs.ics',
  asyncHandler(async (req, res) => {
    if (req.query.token !== FEED_TOKEN) throw new ApiError(401, 'Invalid calendar feed token');
    const jobs = await prisma.job.findMany({ orderBy: { scheduledDate: 'asc' } });
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orange-blossom-schedule.ics"');
    res.send(buildIcs(jobs));
  }),
);

// The feed URL + token, for the Settings/Schedule UI to display a subscribe link.
router.get(
  '/feed-info',
  asyncHandler(async (_req, res) => {
    res.json({ path: '/api/calendar/jobs.ics', token: FEED_TOKEN });
  }),
);

export default router;
