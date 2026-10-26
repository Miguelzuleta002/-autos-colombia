// Repositorio de vehículos - operaciones CRUD sobre vehiculos.json

import { readJsonFile, writeJsonFile } from '../fileManager.js';
import { FILE_PATHS } from '../../config/constants.js';

/**
 * Obtiene todos los vehículos.
 * @returns {Promise<Array>} Lista de vehículos
 */
export async function findAll() {
  return readJsonFile(FILE_PATHS.VEHICULOS);
}

/**
 * Busca un vehículo por su ID.
 * @param {string} id - ID del vehículo
 * @returns {Promise<object|null>} Vehículo encontrado o null
 */
export async function findById(id) {
  const vehiculos = await findAll();
  return vehiculos.find((v) => v.id === id) || null;
}

/**
 * Busca un vehículo por su placa (coincidencia exacta, case-insensitive).
 * @param {string} placa - Placa del vehículo
 * @returns {Promise<object|null>} Vehículo encontrado o null
 */
export async function findByPlaca(placa) {
  const vehiculos = await findAll();
  const placaNorm = placa.toUpperCase().trim();
  return vehiculos.find((v) => v.placa === placaNorm) || null;
}

/**
 * Busca vehículos cuya placa contenga el texto indicado (coincidencia parcial, case-insensitive).
 * @param {string} placa - Texto parcial de placa
 * @returns {Promise<Array>} Lista de vehículos que coinciden
 */
export async function searchByPlaca(placa) {
  const vehiculos = await findAll();
  const term = placa.toUpperCase().trim();
  return vehiculos.filter((v) => v.placa.includes(term));
}

/**
 * Guarda la lista completa de vehículos.
 * @param {Array} vehiculos - Lista de vehículos a persistir
 */
export async function saveAll(vehiculos) {
  await writeJsonFile(FILE_PATHS.VEHICULOS, vehiculos);
}
