// Clases de error personalizadas para la aplicación

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
 * Error cuando un recurso no es encontrado.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Error de validación de datos de entrada.
 */
export class ValidationError extends AppError {
  constructor(message = 'Datos de entrada inválidos') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Error de conflicto (recurso duplicado o estado inconsistente).
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}
