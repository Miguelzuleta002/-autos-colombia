// Controlador del dashboard - resumen del parqueadero

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as dashboardService from '../../application/dashboard.service.js';

/**
 * GET /api/dashboard/summary
 * Retorna el resumen general del estado del parqueadero.
 */
export const getSummary = asyncHandler(async (_req, res) => {
  const resumen = await dashboardService.obtenerResumen();
  res.json({ success: true, data: resumen });
});
