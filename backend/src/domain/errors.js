// Clases de error personalizadas para la aplicación Autos Colombia

/**
 * Error base de la aplicación.
 * Todos los errores controlados extienden de esta clase.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código HTTP asociado
   * @param {string} code - Código interno del error
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Error cuando un recurso no es encontrado (404).
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Error de validación de datos de entrada (400).
 */
export class ValidationError extends AppError {
  constructor(message = 'Datos de entrada inválidos') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Error de conflicto - recurso duplicado o estado inconsistente (409).
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Error de autenticación - usuario no autenticado o no encontrado (401).
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'UNAUTHORIZED_ERROR');
  }
}

/**
 * Error de autorización - permisos insuficientes para la acción (403).
 */
export class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para realizar esta acción') {
    super(message, 403, 'FORBIDDEN_ERROR');
  }
}
