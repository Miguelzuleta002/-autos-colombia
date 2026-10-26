// Servicio de dashboard - cálculos de resumen del parqueadero

import * as celdaRepo from '../persistence/repositories/celda.repository.js';
import * as movimientoRepo from '../persistence/repositories/movimiento.repository.js';
import { ESTADO_CELDA, ESTADO_MOVIMIENTO } from '../config/constants.js';

/**
 * Calcula el resumen general del dashboard.
 * @returns {Promise<object>} Datos de resumen del parqueadero
 */
export async function obtenerResumen() {
  const [celdas, movimientos] = await Promise.all([
    celdaRepo.findAll(),
    movimientoRepo.findAll(),
  ]);

  const totalCeldas = celdas.length;
  const celdasOcupadas = celdas.filter((c) => c.estado === ESTADO_CELDA.OCUPADA).length;
  const celdasLibres = celdas.filter((c) => c.estado === ESTADO_CELDA.LIBRE).length;
  const celdasMantenimiento = celdas.filter((c) => c.estado === ESTADO_CELDA.MANTENIMIENTO).length;

  // Filtrar movimientos de hoy
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1).toISOString();

  const entradasHoy = movimientos.filter(
    (m) => m.fechaHoraEntrada >= inicioHoy && m.fechaHoraEntrada < finHoy
  ).length;

  const salidasHoy = movimientos.filter(
    (m) =>
      m.estado === ESTADO_MOVIMIENTO.CERRADO &&
      m.fechaHoraSalida &&
      m.fechaHoraSalida >= inicioHoy &&
      m.fechaHoraSalida < finHoy
  ).length;

  // Porcentaje de ocupación (excluyendo celdas en mantenimiento)
  const celdasDisponibles = totalCeldas - celdasMantenimiento;
  const porcentajeOcupacion = celdasDisponibles > 0
    ? Math.round((celdasOcupadas / celdasDisponibles) * 100)
    : 0;

  return {
    totalCeldas,
    celdasOcupadas,
    celdasLibres,
    celdasMantenimiento,
    entradasHoy,
    salidasHoy,
    porcentajeOcupacion,
  };
}
