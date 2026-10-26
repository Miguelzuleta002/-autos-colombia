// Gestor de archivos JSON con bloqueo en memoria para evitar escrituras concurrentes

import fs from 'fs/promises';
import path from 'path';

/**
 * Mutex simple en memoria por archivo.
 * Previene corrupción por escrituras concurrentes al mismo archivo.
 */
const locks = new Map();

/**
 * Adquiere el mutex para un archivo dado.
 * @param {string} filePath - Ruta absoluta del archivo
 * @returns {Promise<Function>} Función para liberar el mutex
 */
async function acquireLock(filePath) {
  while (locks.get(filePath)) {
    // Esperar a que se libere el lock actual
    await locks.get(filePath);
  }

  let releaseFn;
  const lockPromise = new Promise((resolve) => {
    releaseFn = resolve;
  });
  locks.set(filePath, lockPromise);

  return () => {
    locks.delete(filePath);
    releaseFn();
  };
}

/**
 * Lee un archivo JSON y retorna su contenido como arreglo.
 * Si el archivo no existe, retorna un arreglo vacío.
 * @param {string} filePath - Ruta absoluta del archivo JSON
 * @returns {Promise<Array>} Contenido del archivo
 */
export async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, retornar arreglo vacío
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Escribe datos en un archivo JSON de forma atómica.
 * Usa un archivo temporal y luego lo renombra para evitar corrupción.
 * @param {string} filePath - Ruta absoluta del archivo JSON
 * @param {Array} data - Datos a escribir
 */
export async function writeJsonFile(filePath, data) {
  const release = await acquireLock(filePath);
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
  } finally {
    release();
  }
}

/**
 * Verifica si un archivo existe.
 * @param {string} filePath - Ruta absoluta del archivo
 * @returns {Promise<boolean>}
 */
export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
