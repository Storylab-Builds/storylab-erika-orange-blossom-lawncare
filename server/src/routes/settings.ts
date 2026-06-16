import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { asyncHandler } from '../lib/http';
import { parse } from '../lib/validate';
import { requireRole } from '../middleware/auth';
import { maskSecret, getIntegrationsConfig } from '../services/integrations';

const router = Router();

// Secret fields inside the `integrations` setting that must never be sent to the
// browser in full. We return a masked preview + a *Configured boolean instead.
const SECRET_PATHS = [
  ['twilio', 'authToken'],
  ['twilio', 'accountSid'],
  ['resend', 'apiKey'],
] as const;

type Dict = Record<string, Record<string, unknown>>;

// Masks secrets AND reports the EFFECTIVE configured state (DB value OR .env
// fallback), so the UI correctly shows "configured" when creds live in the
// environment even if the DB row is blank.
async function maskIntegrations(value: unknown): Promise<unknown> {
  const v = (value && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : {}) as Dict;
  const eff = await getIntegrationsConfig();
  const effectiveSecret: Record<string, string> = {
    'twilio.authToken': eff.twilio.authToken,
    'twilio.accountSid': eff.twilio.accountSid,
    'resend.apiKey': eff.resend.apiKey,
  };
  for (const [group, field] of SECRET_PATHS) {
    const raw = v[group]?.[field];
    const effVal = effectiveSecret[`${group}.${field}`] || '';
    v[group] = v[group] || {};
    // Prefer masking the DB value if present, else mask the effective (env) value.
    v[group][field] = typeof raw === 'string' && raw.trim() !== '' ? maskSecret(raw) : maskSecret(effVal);
    v[group][`${field}Configured`] = (typeof raw === 'string' && raw.trim() !== '') || effVal.trim() !== '';
    v[group][`${field}Source`] =
      typeof raw === 'string' && raw.trim() !== '' ? 'settings' : effVal.trim() !== '' ? 'environment' : 'none';
  }
  return v;
}

// When saving integrations, a masked or blank secret means "keep the current value".
function mergeIntegrations(incoming: unknown, existing: unknown): unknown {
  const inc = (incoming && typeof incoming === 'object' ? JSON.parse(JSON.stringify(incoming)) : {}) as Dict;
  const ex = (existing && typeof existing === 'object' ? (existing as Dict) : {}) as Dict;
  for (const [group, field] of SECRET_PATHS) {
    const candidate = inc[group]?.[field];
    const isBlankOrMasked =
      typeof candidate !== 'string' || candidate.trim() === '' || candidate.includes('••');
    if (isBlankOrMasked && ex[group]?.[field] != null) {
      inc[group] = inc[group] || {};
      inc[group][field] = ex[group][field];
    }
    // strip any *Configured helper flags that the client echoed back
    if (inc[group]) delete inc[group][`${field}Configured`];
  }
  return inc;
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany();
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      settings[row.key] = row.key === 'integrations' ? await maskIntegrations(row.value) : row.value;
    }
    res.json(settings);
  }),
);

const upsertSchema = z.object({ value: z.unknown() });

// Only owners/admins may change settings.
router.put(
  '/:key',
  requireRole('OWNER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { value } = parse(upsertSchema, req.body);
    let toStore = value;
    if (req.params.key === 'integrations') {
      const existing = await prisma.setting.findUnique({ where: { key: 'integrations' } });
      toStore = mergeIntegrations(value, existing?.value);
    }
    const row = await prisma.setting.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value: toStore as object },
      update: { value: toStore as object },
    });
    res.json({
      key: row.key,
      value: row.key === 'integrations' ? await maskIntegrations(row.value) : row.value,
    });
  }),
);

export default router;
