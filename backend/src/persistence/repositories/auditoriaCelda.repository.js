// Repositorio de auditoría de celdas - persistencia sobre auditorias_celda.json (Iteración 2)

import { readJsonFile, writeJsonFile } from '../fileManager.js';
import { FILE_PATHS } from '../../config/constants.js';

/**
 * Obtiene todas las auditorías de celdas.
 * @returns {Promise<Array>} Lista de registros de auditoría
 */
export async function findAll() {
  return readJsonFile(FILE_PATHS.AUDITORIAS_CELDA);
}

/**
 * Obtiene todas las auditorías registradas para una celda específica, ordenadas por fecha descendente.
 * @param {string} celdaId - ID de la celda
 * @returns {Promise<Array>} Auditorías de la celda
 */
export async function findByCeldaId(celdaId) {
  const auditorias = await findAll();
  return auditorias
    .filter((a) => a.celdaId === celdaId)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Agrega un nuevo registro de auditoría.
 * @param {object} auditoria - Objeto de auditoría a persistir
 * @returns {Promise<object>} Registro persistido
 */
export async function create(auditoria) {
  const auditorias = await findAll();
  auditorias.push(auditoria);
  await saveAll(auditorias);
  return auditoria;
}

/**
 * Guarda la lista completa de auditorías.
 * @param {Array} auditorias
 */
export async function saveAll(auditorias) {
  await writeJsonFile(FILE_PATHS.AUDITORIAS_CELDA, auditorias);
}
