// Controlador de celdas (Iteración 1 y 2)

import * as celdaService from '../../application/celda.service.js';

export async function getCeldas(req, res) {
  const { estado, tipo, ubicacion, busqueda, codigo } = req.query;
  const celdas = await celdaService.obtenerTodas({ estado, tipo, ubicacion, busqueda, codigo });
  res.json({
    success: true,
    data: celdas,
  });
}

export async function getCeldaPorId(req, res) {
  const { id } = req.params;
  const celda = await celdaService.obtenerPorId(id);
  res.json({
    success: true,
    data: celda,
  });
}

export async function postCelda(req, res) {
  const nuevaCelda = await celdaService.registrarCelda(req.body, req.usuario);
  res.status(201).json({
    success: true,
    data: nuevaCelda,
  });
}

export async function patchCelda(req, res) {
  const { id } = req.params;
  const actualizada = await celdaService.actualizarCelda(id, req.body, req.usuario);
  res.json({
    success: true,
    data: actualizada,
  });
}

export async function postMantenimiento(req, res) {
  const { id } = req.params;
  const { motivo, detalle } = req.body;
  const actualizada = await celdaService.enviarAMantenimiento(id, { motivo, detalle }, req.usuario);
  res.json({
    success: true,
    data: actualizada,
  });
}

export async function postHabilitar(req, res) {
  const { id } = req.params;
  const { motivo, detalle } = req.body;
  const actualizada = await celdaService.habilitarCelda(id, { motivo, detalle }, req.usuario);
  res.json({
    success: true,
    data: actualizada,
  });
}
