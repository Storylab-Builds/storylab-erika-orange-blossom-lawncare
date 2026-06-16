import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler, ApiError } from '../lib/http';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const snapshot = await prisma.weatherSnapshot.findFirst({ orderBy: { id: 'asc' } });
    if (!snapshot) throw new ApiError(404, 'No weather data available');
    res.json(snapshot.data);
  }),
);

export default router;
