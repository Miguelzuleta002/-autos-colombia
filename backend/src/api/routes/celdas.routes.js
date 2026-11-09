// Rutas para la gestión de celdas (Iteración 1 y 2)

import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requireRole } from '../middlewares/auth.js';
import { ROL_USUARIO } from '../../config/constants.js';
import * as celdasController from '../controllers/celdas.controller.js';

const router = Router();

// Consulta permitida para Administrador y Operador
router.get('/', asyncHandler(celdasController.getCeldas));
router.get('/:id', asyncHandler(celdasController.getCeldaPorId));

// Modificaciones y mantenimiento restringidas exclusivamente a Administrador
router.post('/', requireRole(ROL_USUARIO.ADMINISTRADOR), asyncHandler(celdasController.postCelda));
router.patch('/:id', requireRole(ROL_USUARIO.ADMINISTRADOR), asyncHandler(celdasController.patchCelda));
router.post('/:id/mantenimiento', requireRole(ROL_USUARIO.ADMINISTRADOR), asyncHandler(celdasController.postMantenimiento));
router.post('/:id/habilitar', requireRole(ROL_USUARIO.ADMINISTRADOR), asyncHandler(celdasController.postHabilitar));

export default router;
