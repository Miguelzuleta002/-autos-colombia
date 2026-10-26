// Rutas del dashboard

import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

// GET /api/dashboard/summary - Resumen del parqueadero
router.get('/summary', dashboardController.getSummary);

export default router;
