// Repositorio de celdas - operaciones CRUD sobre celdas.json (Iteración 1 y 2)

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
 * Busca una celda por su código único (ej: "A-01").
 * @param {string} codigo - Código de la celda
 * @returns {Promise<object|null>} Celda encontrada o null
 */
export async function findByCodigo(codigo) {
  if (!codigo) return null;
  const codigoNorm = codigo.toUpperCase().trim();
  const celdas = await findAll();
  return celdas.find((c) => c.codigo.toUpperCase().trim() === codigoNorm) || null;
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
 * Agrega una nueva celda a la colección.
 * @param {object} nuevaCelda
 * @returns {Promise<object>}
 */
export async function create(nuevaCelda) {
  const celdas = await findAll();
  celdas.push(nuevaCelda);
  await saveAll(celdas);
  return nuevaCelda;
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

  celdas[index] = {
    ...celdas[index],
    ...updates,
    fechaActualizacion: new Date().toISOString(),
  };
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
