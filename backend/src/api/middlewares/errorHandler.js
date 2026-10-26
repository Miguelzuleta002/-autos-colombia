// Middleware centralizado de manejo de errores

import { AppError } from '../../domain/errors.js';

/**
 * Middleware de manejo de errores.
 * Intercepta todos los errores y responde con formato consistente.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  // Si es un error controlado de la aplicación
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  // Error no controlado - registrar en consola para depuración
  console.error('Error no controlado:', err);

  return res.status(500).json({
    success: false,
    error: {
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    },
  });
};
