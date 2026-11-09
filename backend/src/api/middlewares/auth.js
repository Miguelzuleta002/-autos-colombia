// Middleware de autenticación y autorización demo para Autos Colombia (Iteración 2)
// NOTA: Este mecanismo es para desarrollo local y no sustituye autenticación de producción con tokens/passwords

import * as usuarioRepo from '../../persistence/repositories/usuario.repository.js';
import { UnauthorizedError, ForbiddenError } from '../../domain/errors.js';
import { ROL_USUARIO } from '../../config/constants.js';

// ID de usuario demo en memoria (permite alternar en caliente desde la interfaz o pruebas)
let activeDemoUserId = process.env.DEMO_USER_ID || null;

/**
 * Obtiene el ID del usuario demo configurado actualmente en memoria.
 */
export function getActiveDemoUserId() {
  return activeDemoUserId;
}

/**
 * Permite actualizar el usuario demo activo en caliente (para testing y pruebas de roles en UI).
 * @param {string} id
 */
export function setActiveDemoUserId(id) {
  activeDemoUserId = id;
}

/**
 * Resuelve el usuario actual en base al contexto (header x-demo-user-id, variable en memoria o default).
 * @param {import('express').Request} req
 * @returns {Promise<object>}
 */
export async function resolverUsuarioActual(req = null) {
  const headerId = req?.headers ? req.headers['x-demo-user-id'] : null;
  const targetId = headerId || activeDemoUserId || process.env.DEMO_USER_ID;

  if (targetId) {
    const usuario = await usuarioRepo.findById(targetId);
    if (usuario) return usuario;
  }

  // Si no hay ninguno configurado o no existe, intentar con el primer administrador activo
  const admin = await usuarioRepo.findDefaultAdmin();
  if (admin) return admin;

  // Fallback a cualquier operador activo
  const operador = await usuarioRepo.findDefaultOperador();
  if (operador) return operador;

  // Fallback si no hay ninguno activo
  const todos = await usuarioRepo.findAll();
  return todos[0] || null;
}

/**
 * Middleware que adjunta el usuario actual a `req.usuario`.
 */
export async function attachUserContext(req, _res, next) {
  try {
    const usuario = await resolverUsuarioActual(req);
    req.usuario = usuario;
    req.usuarioId = usuario?.id || null;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para exigir uno o más roles específicos.
 * @param {Array<string>|string} roles - Rol o lista de roles permitidos
 */
export function requireRole(roles) {
  const rolesArray = Array.isArray(roles) ? roles : [roles];

  return (req, _res, next) => {
    const usuario = req.usuario;

    if (!usuario) {
      return next(new UnauthorizedError('No se identificó ningún usuario de demostración activo'));
    }

    if (!usuario.activo && usuario.estado !== 'ACTIVO') {
      return next(new ForbiddenError('El usuario actual está INACTIVO y no tiene permitido ejecutar operaciones'));
    }

    // Normalizar roles para comparación
    const rolUsuario = usuario.rol === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : usuario.rol;
    const tienePermiso = rolesArray.some((r) => {
      const rNorm = r === 'ADMIN' ? ROL_USUARIO.ADMINISTRADOR : r;
      return rNorm === rolUsuario;
    });

    if (!tienePermiso) {
      return next(
        new ForbiddenError(
          `Acción no autorizada. El rol requerido es [${rolesArray.join(', ')}], pero el rol actual es [${rolUsuario}]`
        )
      );
    }

    next();
  };
}
