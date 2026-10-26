// Controlador de movimientos - entradas, salidas, historial

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as movimientoService from '../../application/movimiento.service.js';

/**
 * GET /api/movimientos/abiertos
 * Retorna todos los movimientos actualmente abiertos (vehículos dentro).
 */
export const getAbiertos = asyncHandler(async (_req, res) => {
  const abiertos = await movimientoService.obtenerAbiertos();
  res.json({ success: true, data: abiertos });
});

/**
 * GET /api/movimientos
 * Retorna todos los movimientos con filtros opcionales.
 * Query params: placa, fechaDesde, fechaHasta, estado
 */
export const getMovimientos = asyncHandler(async (req, res) => {
  const { placa, fechaDesde, fechaHasta, estado } = req.query;
  const movimientos = await movimientoService.obtenerTodos({ placa, fechaDesde, fechaHasta, estado });
  res.json({ success: true, data: movimientos });
});

/**
 * GET /api/movimientos/:id
 * Retorna un movimiento específico con todos sus datos poblados.
 */
export const getMovimientoById = asyncHandler(async (req, res) => {
  const movimiento = await movimientoService.obtenerPorId(req.params.id);
  res.json({ success: true, data: movimiento });
});

/**
 * POST /api/movimientos/entrada
 * Registra la entrada de un vehículo al parqueadero.
 * Body: { placa, celdaId, observacionEntrada?, operadorId? }
 */
export const registrarEntrada = asyncHandler(async (req, res) => {
  const { placa, celdaId, observacionEntrada, operadorId } = req.body;
  const movimiento = await movimientoService.registrarEntrada({
    placa,
    celdaId,
    observacionEntrada,
    operadorId,
  });
  res.status(201).json({ success: true, data: movimiento });
});

/**
 * POST /api/movimientos/:id/salida
 * Registra la salida de un vehículo del parqueadero.
 * Body: { observacionSalida?, operadorId? }
 */
export const registrarSalida = asyncHandler(async (req, res) => {
  const { observacionSalida, operadorId } = req.body;
  const movimiento = await movimientoService.registrarSalida(req.params.id, {
    observacionSalida,
    operadorId,
  });
  res.json({ success: true, data: movimiento });
});
