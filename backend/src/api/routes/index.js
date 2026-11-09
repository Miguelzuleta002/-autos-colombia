// Enrutador principal - combina todos los módulos de rutas bajo /api (Iteración 1 y 2)

import { Router } from 'express';
import { attachUserContext } from '../middlewares/auth.js';
import sesionRoutes from './sesion.routes.js';
import usuariosRoutes from './usuarios.routes.js';
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

// Adjuntar contexto de usuario demo a todas las solicitudes bajo /api
router.use(attachUserContext);

// Módulos de rutas
router.use('/sesion', sesionRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehiculos', vehiculosRoutes);
router.use('/celdas', celdasRoutes);
router.use('/movimientos', movimientosRoutes);

export default router;
