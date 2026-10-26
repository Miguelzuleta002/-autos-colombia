// Rutas de celdas

import { Router } from 'express';
import * as celdasController from '../controllers/celdas.controller.js';

const router = Router();

// GET /api/celdas - Listar/filtrar celdas
router.get('/', celdasController.getCeldas);

export default router;
