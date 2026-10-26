// Controlador de vehículos - búsqueda y listado

import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as vehiculoRepo from '../../persistence/repositories/vehiculo.repository.js';
import * as clienteRepo from '../../persistence/repositories/cliente.repository.js';

/**
 * GET /api/vehiculos?placa=ABC
 * Retorna vehículos, opcionalmente filtrados por placa (coincidencia parcial).
 * Incluye datos del cliente asociado.
 */
export const getVehiculos = asyncHandler(async (req, res) => {
  const { placa } = req.query;

  let vehiculos;
  if (placa) {
    vehiculos = await vehiculoRepo.searchByPlaca(placa);
  } else {
    vehiculos = await vehiculoRepo.findAll();
  }

  // Poblar datos del cliente para cada vehículo
  const vehiculosPoblados = await Promise.all(
    vehiculos.map(async (vehiculo) => {
      const cliente = await clienteRepo.findById(vehiculo.clienteId);
      return { ...vehiculo, cliente: cliente || null };
    })
  );

  res.json({ success: true, data: vehiculosPoblados });
});
