// Rutas de movimientos

import { Router } from 'express';
import * as movimientosController from '../controllers/movimientos.controller.js';

const router = Router();

// GET /api/movimientos/abiertos - Movimientos activos (vehículos dentro)
// IMPORTANTE: esta ruta va ANTES de /:id para evitar que "abiertos" se interprete como un ID
router.get('/abiertos', movimientosController.getAbiertos);

// GET /api/movimientos - Todos los movimientos con filtros
router.get('/', movimientosController.getMovimientos);

// GET /api/movimientos/:id - Un movimiento específico
router.get('/:id', movimientosController.getMovimientoById);

// POST /api/movimientos/entrada - Registrar entrada de vehículo
router.post('/entrada', movimientosController.registrarEntrada);

// POST /api/movimientos/:id/salida - Registrar salida de vehículo
router.post('/:id/salida', movimientosController.registrarSalida);

export default router;
