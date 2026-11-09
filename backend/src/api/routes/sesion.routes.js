// Rutas para la sesión demo (Iteración 2)

import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as sesionController from '../controllers/sesion.controller.js';

const router = Router();

router.get('/actual', asyncHandler(sesionController.getSesionActual));
router.post('/cambiar-demo', asyncHandler(sesionController.postCambiarDemo));

export default router;
