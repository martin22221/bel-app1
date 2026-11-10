import { Router } from 'express';
import authRoutes from './auth.routes.js';

// Всички маршрути на API-то. Новите се добавят тук.
const router = Router();

router.use('/auth', authRoutes);

export default router;
