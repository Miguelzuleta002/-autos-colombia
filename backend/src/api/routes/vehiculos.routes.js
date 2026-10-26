// Rutas de vehículos

import { Router } from 'express';
import * as vehiculosController from '../controllers/vehiculos.controller.js';

const router = Router();

// GET /api/vehiculos - Listar/buscar vehículos
router.get('/', vehiculosController.getVehiculos);

export default router;
