import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Role, User } from '@prisma/client';
import { prisma } from '../db';
import { asyncHandler, ApiError } from '../lib/http';
import { parse } from '../lib/validate';
import { requireAuth, signToken } from '../middleware/auth';

const router = Router();

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

export default router;
