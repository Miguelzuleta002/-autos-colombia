// Repositorio de celdas - operaciones CRUD sobre celdas.json

import { readJsonFile, writeJsonFile } from '../fileManager.js';
import { FILE_PATHS } from '../../config/constants.js';

/**
 * Obtiene todas las celdas.
 * @returns {Promise<Array>} Lista de celdas
 */
export async function findAll() {
  return readJsonFile(FILE_PATHS.CELDAS);
}

/**
 * Busca una celda por su ID.
 * @param {string} id - ID de la celda
 * @returns {Promise<object|null>} Celda encontrada o null
 */
export async function findById(id) {
  const celdas = await findAll();
  return celdas.find((c) => c.id === id) || null;
}

/**
 * Filtra celdas por estado.
 * @param {string} estado - Estado de celda (LIBRE, OCUPADA, MANTENIMIENTO)
 * @returns {Promise<Array>} Lista de celdas filtradas
 */
export async function findByEstado(estado) {
  const celdas = await findAll();
  return celdas.filter((c) => c.estado === estado);
}

/**
 * Actualiza una celda existente por su ID.
 * @param {string} id - ID de la celda
 * @param {object} updates - Campos a actualizar
 * @returns {Promise<object|null>} Celda actualizada o null si no existe
 */
export async function updateById(id, updates) {
  const celdas = await findAll();
  const index = celdas.findIndex((c) => c.id === id);
  if (index === -1) return null;

  celdas[index] = { ...celdas[index], ...updates };
  await saveAll(celdas);
  return celdas[index];
}

/**
 * Guarda la lista completa de celdas.
 * @param {Array} celdas - Lista de celdas a persistir
 */
export async function saveAll(celdas) {
  await writeJsonFile(FILE_PATHS.CELDAS, celdas);
}
