// Envuelve controladores async para capturar errores automáticamente

/**
 * Wrapper para funciones async de Express.
 * Captura cualquier error rechazado y lo pasa al middleware de errores.
 * @param {Function} fn - Función async (req, res, next)
 * @returns {Function} Función middleware de Express
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
