// Enrutador principal - combina todos los módulos de rutas bajo /api

import { Router } from 'express';
import dashboardRoutes from './dashboard.routes.js';
import vehiculosRoutes from './vehiculos.routes.js';
import celdasRoutes from './celdas.routes.js';
import movimientosRoutes from './movimientos.routes.js';

const router = Router();

// Endpoint de salud
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Módulos de rutas
router.use('/dashboard', dashboardRoutes);
router.use('/vehiculos', vehiculosRoutes);
router.use('/celdas', celdasRoutes);
router.use('/movimientos', movimientosRoutes);

export default router;
