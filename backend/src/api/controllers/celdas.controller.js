// Controlador de celdas - listado y filtrado

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as celdaRepo from '../../persistence/repositories/celda.repository.js';

/**
 * GET /api/celdas?estado=LIBRE
 * Retorna celdas, opcionalmente filtradas por estado.
 */
export const getCeldas = asyncHandler(async (req, res) => {
  const { estado } = req.query;

  let celdas;
  if (estado) {
    celdas = await celdaRepo.findByEstado(estado.toUpperCase());
  } else {
    celdas = await celdaRepo.findAll();
  }

  res.json({ success: true, data: celdas });
});
