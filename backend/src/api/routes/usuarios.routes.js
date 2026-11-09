// Rutas para la gestión de usuarios (Iteración 2)
// Solo accesibles para el rol ADMINISTRADOR

import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { requireRole } from '../middlewares/auth.js';
import { ROL_USUARIO } from '../../config/constants.js';
import * as usuariosController from '../controllers/usuarios.controller.js';

const router = Router();

// Todas las rutas de usuarios requieren rol ADMINISTRADOR
router.use(requireRole(ROL_USUARIO.ADMINISTRADOR));

router.get('/', asyncHandler(usuariosController.getUsuarios));
router.get('/:id', asyncHandler(usuariosController.getUsuarioPorId));
router.post('/', asyncHandler(usuariosController.postUsuario));
router.patch('/:id', asyncHandler(usuariosController.patchUsuario));
router.patch('/:id/estado', asyncHandler(usuariosController.patchEstadoUsuario));

export default router;
