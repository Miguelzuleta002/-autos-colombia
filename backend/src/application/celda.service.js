// Servicio de celdas - lógica de negocio y mantenimiento (Iteración 1 y 2)

import * as celdaRepo from '../persistence/repositories/celda.repository.js';
import * as auditoriaRepo from '../persistence/repositories/auditoriaCelda.repository.js';
import * as movimientoRepo from '../persistence/repositories/movimiento.repository.js';
import * as vehiculoRepo from '../persistence/repositories/vehiculo.repository.js';
import * as clienteRepo from '../persistence/repositories/cliente.repository.js';
import { crearCelda, crearAuditoriaCelda } from '../domain/entities.js';
import { NotFoundError, ValidationError, ConflictError } from '../domain/errors.js';
import { ESTADO_CELDA, TIPO_CELDA } from '../config/constants.js';

/**
 * Consulta y filtra la lista de celdas, poblando vehículos en celdas ocupadas.
 * @param {{ codigo?: string, tipo?: string, estado?: string, ubicacion?: string, busqueda?: string }} filtros
 * @returns {Promise<Array>}
 */
export async function obtenerTodas(filtros = {}) {
  let celdas = await celdaRepo.findAll();
  const movimientosAbiertos = await movimientoRepo.findAbiertos();

  // Poblar información de ocupación si la celda está OCUPADA
  const celdasPobladas = await Promise.all(
    celdas.map(async (celda) => {
      if (celda.estado === ESTADO_CELDA.OCUPADA) {
        const mov = movimientosAbiertos.find((m) => m.celdaId === celda.id);
        if (mov) {
          const vehiculo = await vehiculoRepo.findById(mov.vehiculoId);
          let cliente = null;
          if (vehiculo) {
            cliente = await clienteRepo.findById(vehiculo.clienteId);
          }
          return {
            ...celda,
            ocupacionActual: {
              movimientoId: mov.id,
              fechaHoraEntrada: mov.fechaHoraEntrada,
              observacionEntrada: mov.observacionEntrada,
              vehiculo: vehiculo ? { ...vehiculo, cliente } : null,
            },
          };
        }
      }
      return {
        ...celda,
        ocupacionActual: null,
      };
    })
  );

  let resultado = celdasPobladas;

  // Filtro de búsqueda general (código o ubicación)
  if (filtros.busqueda) {
    const term = filtros.busqueda.toUpperCase().trim();
    resultado = resultado.filter(
      (c) => c.codigo.toUpperCase().includes(term) || (c.ubicacion && c.ubicacion.toUpperCase().includes(term))
    );
  }

  // Filtro por código específico
  if (filtros.codigo) {
    const cod = filtros.codigo.toUpperCase().trim();
    resultado = resultado.filter((c) => c.codigo.toUpperCase().includes(cod));
  }

  // Filtro por estado
  if (filtros.estado) {
    const estadoFiltro = filtros.estado.toUpperCase().trim();
    resultado = resultado.filter((c) => c.estado === estadoFiltro);
  }

  // Filtro por tipo / compatibilidad
  if (filtros.tipo) {
    const tipoFiltro = filtros.tipo.toUpperCase().trim();
    resultado = resultado.filter((c) => c.tipo === tipoFiltro);
  }

  // Filtro por ubicación
  if (filtros.ubicacion) {
    const ubiFiltro = filtros.ubicacion.toLowerCase().trim();
    resultado = resultado.filter((c) => c.ubicacion && c.ubicacion.toLowerCase().includes(ubiFiltro));
  }

  // Ordenar naturalmente por código (A-01, A-02, B-01...)
  resultado.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' }));

  return resultado;
}

/**
 * Obtiene el detalle de una celda por su ID, con ocupación e historial de mantenimiento/auditoría.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function obtenerPorId(id) {
  const celda = await celdaRepo.findById(id);
  if (!celda) {
    throw new NotFoundError(`No se encontró la celda con ID "${id}"`);
  }

  // Obtener ocupación si aplica
  let ocupacionActual = null;
  if (celda.estado === ESTADO_CELDA.OCUPADA) {
    const abierto = await movimientoRepo.findAbiertoByCeldaId(id);
    if (abierto) {
      const vehiculo = await vehiculoRepo.findById(abierto.vehiculoId);
      let cliente = null;
      if (vehiculo) {
        cliente = await clienteRepo.findById(vehiculo.clienteId);
      }
      ocupacionActual = {
        movimientoId: abierto.id,
        fechaHoraEntrada: abierto.fechaHoraEntrada,
        observacionEntrada: abierto.observacionEntrada,
        vehiculo: vehiculo ? { ...vehiculo, cliente } : null,
      };
    }
  }

  // Obtener historial de auditorías
  const auditorias = await auditoriaRepo.findByCeldaId(id);

  return {
    ...celda,
    ocupacionActual,
    historialAuditoria: auditorias,
  };
}

/**
 * Registra una nueva celda en el parqueadero (RF20).
 * Toda nueva celda inicia en estado LIBRE.
 * @param {object} datos
 * @param {object} usuarioResponsable
 * @returns {Promise<object>}
 */
export async function registrarCelda(datos, usuarioResponsable) {
  const { codigo, ubicacion, tipo, descripcion } = datos;

  if (!codigo || String(codigo).trim() === '') {
    throw new ValidationError('El código de la celda es obligatorio');
  }
  if (!ubicacion || String(ubicacion).trim() === '') {
    throw new ValidationError('La ubicación de la celda es obligatoria');
  }
  if (!tipo || String(tipo).trim() === '') {
    throw new ValidationError('El tipo/compatibilidad de la celda es obligatorio');
  }

  const tipoNorm = tipo.toUpperCase().trim();
  const tiposValidos = Object.values(TIPO_CELDA);
  if (!tiposValidos.includes(tipoNorm)) {
    throw new ValidationError(`Tipo de celda no válido. Permitidos: ${tiposValidos.join(', ')}`);
  }

  const codNorm = codigo.toUpperCase().trim();
  const existente = await celdaRepo.findByCodigo(codNorm);
  if (existente) {
    throw new ConflictError(`Ya existe una celda registrada con el código "${codNorm}"`);
  }

  const nuevaCelda = crearCelda({
    codigo: codNorm,
    ubicacion,
    tipo: tipoNorm,
    descripcion,
    estado: ESTADO_CELDA.LIBRE,
  });

  const creada = await celdaRepo.create(nuevaCelda);

  // Registrar auditoría de creación (RF27)
  await auditoriaRepo.create(
    crearAuditoriaCelda({
      celdaId: creada.id,
      codigoCelda: creada.codigo,
      accion: 'CREACION',
      usuarioResponsableId: usuarioResponsable?.id || 'sistema',
      usuarioResponsableNombre: usuarioResponsable?.nombre || 'Administrador',
      motivo: 'Registro inicial de celda',
      detalle: `Tipo: ${creada.tipo}, Ubicación: ${creada.ubicacion}`,
    })
  );

  return creada;
}

/**
 * Actualiza la información básica de una celda (RF21).
 * No permite modificar el código ni el estado desde este formulario.
 * @param {string} id
 * @param {object} datos
 * @param {object} usuarioResponsable
 * @returns {Promise<object>}
 */
export async function actualizarCelda(id, datos, usuarioResponsable) {
  const celdaActual = await celdaRepo.findById(id);
  if (!celdaActual) {
    throw new NotFoundError(`No se encontró la celda con ID "${id}"`);
  }

  const updates = {};
  const cambiosDetalle = [];

  if (datos.ubicacion && datos.ubicacion.trim() !== celdaActual.ubicacion) {
    cambiosDetalle.push(`Ubicación: "${celdaActual.ubicacion}" → "${datos.ubicacion.trim()}"`);
    updates.ubicacion = datos.ubicacion.trim();
  }

  if (typeof datos.descripcion !== 'undefined') {
    updates.descripcion = datos.descripcion ? datos.descripcion.trim() : '';
  }

  // Cambio de compatibilidad / tipo
  if (datos.tipo && datos.tipo.toUpperCase().trim() !== celdaActual.tipo) {
    const nuevoTipo = datos.tipo.toUpperCase().trim();
    const tiposValidos = Object.values(TIPO_CELDA);
    if (!tiposValidos.includes(nuevoTipo)) {
      throw new ValidationError(`Tipo de celda no válido. Permitidos: ${tiposValidos.join(', ')}`);
    }

    // Regla 9: No modificar la compatibilidad de una celda ocupada
    if (celdaActual.estado === ESTADO_CELDA.OCUPADA) {
      throw new ConflictError(
        'No es posible modificar el tipo o compatibilidad de una celda que está actualmente OCUPADA por un vehículo'
      );
    }

    cambiosDetalle.push(`Tipo: "${celdaActual.tipo}" → "${nuevoTipo}"`);
    updates.tipo = nuevoTipo;
  }

  if (Object.keys(updates).length === 0) {
    return celdaActual;
  }

  const actualizada = await celdaRepo.updateById(id, updates);

  // Registrar auditoría de edición (RF27)
  await auditoriaRepo.create(
    crearAuditoriaCelda({
      celdaId: actualizada.id,
      codigoCelda: actualizada.codigo,
      accion: 'EDICION',
      usuarioResponsableId: usuarioResponsable?.id || 'sistema',
      usuarioResponsableNombre: usuarioResponsable?.nombre || 'Administrador',
      motivo: datos.motivo || 'Actualización de datos generales',
      detalle: cambiosDetalle.join('; ') || 'Actualización de descripción',
    })
  );

  return actualizada;
}

/**
 * Envía una celda libre a mantenimiento (RF22).
 * @param {string} id
 * @param {{ motivo: string, detalle?: string }} datos
 * @param {object} usuarioResponsable
 * @returns {Promise<object>}
 */
export async function enviarAMantenimiento(id, { motivo, detalle }, usuarioResponsable) {
  const celda = await celdaRepo.findById(id);
  if (!celda) {
    throw new NotFoundError(`No se encontró la celda con ID "${id}"`);
  }

  if (celda.estado === ESTADO_CELDA.OCUPADA) {
    throw new ConflictError(
      `La celda "${celda.codigo}" está actualmente OCUPADA. No se puede enviar a mantenimiento hasta que el vehículo salga.`
    );
  }

  if (celda.estado === ESTADO_CELDA.MANTENIMIENTO) {
    throw new ConflictError(`La celda "${celda.codigo}" ya se encuentra en MANTENIMIENTO`);
  }

  if (!motivo || String(motivo).trim() === '') {
    throw new ValidationError('El motivo del mantenimiento es obligatorio');
  }

  const actualizada = await celdaRepo.updateById(id, {
    estado: ESTADO_CELDA.MANTENIMIENTO,
  });

  // Registrar auditoría de mantenimiento (RF27)
  await auditoriaRepo.create(
    crearAuditoriaCelda({
      celdaId: actualizada.id,
      codigoCelda: actualizada.codigo,
      accion: 'MANTENIMIENTO_INICIO',
      usuarioResponsableId: usuarioResponsable?.id || 'sistema',
      usuarioResponsableNombre: usuarioResponsable?.nombre || 'Administrador',
      motivo: motivo.trim(),
      detalle: detalle ? detalle.trim() : 'Puesta en mantenimiento por gestión administrativa',
    })
  );

  return actualizada;
}

/**
 * Habilita una celda en mantenimiento, devolviéndola al estado LIBRE (RF23).
 * @param {string} id
 * @param {{ motivo?: string, detalle?: string }} datos
 * @param {object} usuarioResponsable
 * @returns {Promise<object>}
 */
export async function habilitarCelda(id, { motivo, detalle } = {}, usuarioResponsable) {
  const celda = await celdaRepo.findById(id);
  if (!celda) {
    throw new NotFoundError(`No se encontró la celda con ID "${id}"`);
  }

  // Regla 7: Nunca liberar una celda ocupada desde el módulo administrativo
  if (celda.estado === ESTADO_CELDA.OCUPADA) {
    throw new ConflictError(
      'No se puede liberar manualmente una celda OCUPADA desde la gestión de celdas. Debe registrar la salida del vehículo.'
    );
  }

  if (celda.estado === ESTADO_CELDA.LIBRE) {
    throw new ConflictError(`La celda "${celda.codigo}" ya se encuentra LIBRE`);
  }

  const actualizada = await celdaRepo.updateById(id, {
    estado: ESTADO_CELDA.LIBRE,
  });

  // Registrar auditoría de fin de mantenimiento (RF27)
  await auditoriaRepo.create(
    crearAuditoriaCelda({
      celdaId: actualizada.id,
      codigoCelda: actualizada.codigo,
      accion: 'MANTENIMIENTO_FIN',
      usuarioResponsableId: usuarioResponsable?.id || 'sistema',
      usuarioResponsableNombre: usuarioResponsable?.nombre || 'Administrador',
      motivo: motivo ? motivo.trim() : 'Mantenimiento finalizado',
      detalle: detalle ? detalle.trim() : 'Habilitación de celda para disponibilidad inmediata',
    })
  );

  return actualizada;
}
