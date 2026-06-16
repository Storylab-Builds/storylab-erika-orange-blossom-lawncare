import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Role, User } from '@prisma/client';
import { prisma } from '../db';
import { env } from '../env';
import { asyncHandler, ApiError } from '../lib/http';
import { parse } from '../lib/validate';
import { requireAuth, signToken } from '../middleware/auth';
import { sendEmail } from '../services/email';

const router = Router();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1),
  role: z.enum(['OWNER', 'ADMIN', 'CREW']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function publicUser(u: Pick<User, 'id' | 'email' | 'name' | 'role'>) {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = parse(registerSchema, req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new ApiError(409, 'An account with that email already exists');
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash,
        role: (body.role ?? 'ADMIN') as Role,
      },
    });
    const pub = publicUser(user);
    res.status(201).json({ token: signToken(pub), user: pub });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = parse(loginSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new ApiError(401, 'Invalid email or password');
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid email or password');
    const pub = publicUser(user);
    res.json({ token: signToken(pub), user: pub });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: publicUser(user) });
  }),
);

// --- Password reset (multi-tenant) ---

const forgotSchema = z.object({ email: z.string().email() });

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = parse(forgotSchema, req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond 200 to avoid leaking which emails are registered.
    const generic = { ok: true, message: 'If that email is registered, a reset link is on its way.' };
    if (!user) return res.json(generic);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
    });

    const link = `${env.appBaseUrl}/#/reset-password?token=${token}`;
    const result = await sendEmail({
      to: email,
      subject: 'Reset your Orange Blossom Lawncare password',
      html: `<p>Hi ${user.name},</p><p>We received a request to reset your password.
        Click below (link expires in 1 hour):</p>
        <p><a href="${link}">Reset my password</a></p>
        <p>If you didn't request this, you can ignore this email.</p>`,
      text: `Reset your password: ${link} (expires in 1 hour)`,
      relatedType: 'password-reset', relatedId: user.id,
    });

    // In dev (no live email provider) expose the token so the flow is testable E2E.
    const devToken = env.nodeEnv !== 'production' && result.status === 'logged' ? token : undefined;
    return res.json({ ...generic, ...(devToken ? { devToken, devLink: link } : {}) });
  }),
);

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = parse(resetSchema, req.body);
    const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new ApiError(400, 'This reset link is invalid or has expired.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    ]);
    res.json({ ok: true, message: 'Password updated. You can now sign in.' });
  }),
);

export default router;
