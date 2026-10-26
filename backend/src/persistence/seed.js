// Datos iniciales (seed) para el parqueadero Autos Colombia
// Solo crea los archivos si no existen, preservando datos entre reinicios

import { v4 as uuidv4 } from 'uuid';
import { fileExists, writeJsonFile } from './fileManager.js';
import { FILE_PATHS, ESTADO_CELDA, ESTADO_MOVIMIENTO } from '../config/constants.js';

/**
 * Ejecuta la carga de datos iniciales.
 * Si los archivos JSON ya existen, no los sobreescribe.
 */
export async function seed() {
  // --- IDs predefinidos para mantener relaciones consistentes ---
  const clienteIds = {
    carlos: uuidv4(),
    maria: uuidv4(),
    andres: uuidv4(),
    laura: uuidv4(),
    juan: uuidv4(),
  };

  const vehiculoIds = {
    abc123: uuidv4(),
    def456: uuidv4(),
    ghi789: uuidv4(),
    jkl012: uuidv4(),
    mno345: uuidv4(),
    pqr678: uuidv4(),
    stu901: uuidv4(),
    vwx234: uuidv4(),
  };

  const celdaIds = {};
  // Celdas A-01..A-10
  for (let i = 1; i <= 10; i++) {
    celdaIds[`a${i.toString().padStart(2, '0')}`] = uuidv4();
  }
  // Celdas B-01..B-05
  for (let i = 1; i <= 5; i++) {
    celdaIds[`b${i.toString().padStart(2, '0')}`] = uuidv4();
  }
  // Celdas M-01..M-05
  for (let i = 1; i <= 5; i++) {
    celdaIds[`m${i.toString().padStart(2, '0')}`] = uuidv4();
  }
  // Celdas C-01, C-02
  celdaIds.c01 = uuidv4();
  celdaIds.c02 = uuidv4();

  const usuarioIds = {
    operador: uuidv4(),
    admin: uuidv4(),
  };

  const movimientoIds = {
    mov1: uuidv4(),
    mov2: uuidv4(),
    mov3: uuidv4(),
  };

  // --- Clientes ---
  if (!(await fileExists(FILE_PATHS.CLIENTES))) {
    const clientes = [
      { id: clienteIds.carlos, nombre: 'Carlos Martínez', cedula: '1098765432', telefono: '3001234567', email: 'carlos.martinez@email.com' },
      { id: clienteIds.maria, nombre: 'María López', cedula: '1054321876', telefono: '3109876543', email: 'maria.lopez@email.com' },
      { id: clienteIds.andres, nombre: 'Andrés García', cedula: '1076543210', telefono: '3205551234', email: 'andres.garcia@email.com' },
      { id: clienteIds.laura, nombre: 'Laura Rodríguez', cedula: '1087654321', telefono: '3154447890', email: 'laura.rodriguez@email.com' },
      { id: clienteIds.juan, nombre: 'Juan Pérez', cedula: '1065432109', telefono: '3008887654', email: 'juan.perez@email.com' },
    ];
    await writeJsonFile(FILE_PATHS.CLIENTES, clientes);
    console.log('✅ Datos de clientes creados');
  }

  // --- Vehículos ---
  if (!(await fileExists(FILE_PATHS.VEHICULOS))) {
    const vehiculos = [
      { id: vehiculoIds.abc123, placa: 'ABC123', tipo: 'CARRO', marca: 'Chevrolet', modelo: 'Spark', color: 'Blanco', clienteId: clienteIds.carlos, activo: true },
      { id: vehiculoIds.def456, placa: 'DEF456', tipo: 'CARRO', marca: 'Renault', modelo: 'Sandero', color: 'Gris', clienteId: clienteIds.maria, activo: true },
      { id: vehiculoIds.ghi789, placa: 'GHI789', tipo: 'CAMIONETA', marca: 'Toyota', modelo: 'Hilux', color: 'Negro', clienteId: clienteIds.andres, activo: true },
      { id: vehiculoIds.jkl012, placa: 'JKL012', tipo: 'CARRO', marca: 'Mazda', modelo: '3', color: 'Rojo', clienteId: clienteIds.laura, activo: true },
      { id: vehiculoIds.mno345, placa: 'MNO345', tipo: 'MOTO', marca: 'Yamaha', modelo: 'FZ25', color: 'Azul', clienteId: clienteIds.juan, activo: true },
      { id: vehiculoIds.pqr678, placa: 'PQR678', tipo: 'CARRO', marca: 'Kia', modelo: 'Picanto', color: 'Plata', clienteId: clienteIds.carlos, activo: true },
      { id: vehiculoIds.stu901, placa: 'STU901', tipo: 'MOTO', marca: 'Suzuki', modelo: 'Gixxer', color: 'Negro', clienteId: clienteIds.andres, activo: true },
      { id: vehiculoIds.vwx234, placa: 'VWX234', tipo: 'CAMIONETA', marca: 'Nissan', modelo: 'Frontier', color: 'Blanco', clienteId: clienteIds.maria, activo: false },
    ];
    await writeJsonFile(FILE_PATHS.VEHICULOS, vehiculos);
    console.log('✅ Datos de vehículos creados');
  }

  // --- Celdas ---
  if (!(await fileExists(FILE_PATHS.CELDAS))) {
    const celdas = [];

    // A-01 a A-10 - Piso 1 Zona A, tipo CARRO
    for (let i = 1; i <= 10; i++) {
      const codigo = `A-${i.toString().padStart(2, '0')}`;
      celdas.push({
        id: celdaIds[`a${i.toString().padStart(2, '0')}`],
        codigo,
        ubicacion: 'Piso 1 - Zona A',
        tipo: 'CARRO',
        estado: ESTADO_CELDA.LIBRE,
      });
    }

    // B-01 a B-05 - Piso 1 Zona B, tipo CARRO
    for (let i = 1; i <= 5; i++) {
      const codigo = `B-${i.toString().padStart(2, '0')}`;
      celdas.push({
        id: celdaIds[`b${i.toString().padStart(2, '0')}`],
        codigo,
        ubicacion: 'Piso 1 - Zona B',
        tipo: 'CARRO',
        estado: ESTADO_CELDA.LIBRE,
      });
    }

    // M-01 a M-05 - Piso 1 Zona Motos, tipo MOTO
    for (let i = 1; i <= 5; i++) {
      const codigo = `M-${i.toString().padStart(2, '0')}`;
      celdas.push({
        id: celdaIds[`m${i.toString().padStart(2, '0')}`],
        codigo,
        ubicacion: 'Piso 1 - Zona Motos',
        tipo: 'MOTO',
        estado: ESTADO_CELDA.LIBRE,
      });
    }

    // C-01, C-02 - Piso 1 Zona Camionetas, tipo GENERAL
    celdas.push({
      id: celdaIds.c01,
      codigo: 'C-01',
      ubicacion: 'Piso 1 - Zona Camionetas',
      tipo: 'GENERAL',
      estado: ESTADO_CELDA.LIBRE,
    });
    celdas.push({
      id: celdaIds.c02,
      codigo: 'C-02',
      ubicacion: 'Piso 1 - Zona Camionetas',
      tipo: 'GENERAL',
      estado: ESTADO_CELDA.LIBRE,
    });

    // B-05 en MANTENIMIENTO para pruebas
    const b05 = celdas.find((c) => c.codigo === 'B-05');
    if (b05) b05.estado = ESTADO_CELDA.MANTENIMIENTO;

    // Celdas ocupadas por movimientos abiertos (A-01 y M-01)
    const a01 = celdas.find((c) => c.codigo === 'A-01');
    if (a01) a01.estado = ESTADO_CELDA.OCUPADA;
    const m01 = celdas.find((c) => c.codigo === 'M-01');
    if (m01) m01.estado = ESTADO_CELDA.OCUPADA;

    await writeJsonFile(FILE_PATHS.CELDAS, celdas);
    console.log('✅ Datos de celdas creados');
  }

  // --- Usuarios ---
  if (!(await fileExists(FILE_PATHS.USUARIOS))) {
    const usuarios = [
      { id: usuarioIds.operador, nombre: 'Carlos Ramírez', rol: 'OPERADOR', activo: true },
      { id: usuarioIds.admin, nombre: 'Ana Morales', rol: 'ADMIN', activo: true },
    ];
    await writeJsonFile(FILE_PATHS.USUARIOS, usuarios);
    console.log('✅ Datos de usuarios creados');
  }

  // --- Movimientos ---
  if (!(await fileExists(FILE_PATHS.MOVIMIENTOS))) {
    const ahora = new Date();
    const haceUnaHora = new Date(ahora.getTime() - 60 * 60 * 1000).toISOString();
    const haceTresHoras = new Date(ahora.getTime() - 3 * 60 * 60 * 1000).toISOString();
    const haceDosHoras = new Date(ahora.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const haceMediaHora = new Date(ahora.getTime() - 30 * 60 * 1000).toISOString();

    const movimientos = [
      // Movimiento 1: ABC123 en A-01 (ABIERTO - el vehículo está dentro)
      {
        id: movimientoIds.mov1,
        vehiculoId: vehiculoIds.abc123,
        celdaId: celdaIds.a01,
        operadorEntradaId: usuarioIds.operador,
        operadorSalidaId: null,
        fechaHoraEntrada: haceUnaHora,
        fechaHoraSalida: null,
        observacionEntrada: 'Ingreso sin novedad',
        observacionSalida: null,
        estado: ESTADO_MOVIMIENTO.ABIERTO,
      },
      // Movimiento 2: DEF456 entró y salió (CERRADO - historial)
      {
        id: movimientoIds.mov2,
        vehiculoId: vehiculoIds.def456,
        celdaId: celdaIds.a02,
        operadorEntradaId: usuarioIds.operador,
        operadorSalidaId: usuarioIds.operador,
        fechaHoraEntrada: haceTresHoras,
        fechaHoraSalida: haceDosHoras,
        observacionEntrada: null,
        observacionSalida: 'Salida normal',
        estado: ESTADO_MOVIMIENTO.CERRADO,
      },
      // Movimiento 3: MNO345 (moto) en M-01 (ABIERTO)
      {
        id: movimientoIds.mov3,
        vehiculoId: vehiculoIds.mno345,
        celdaId: celdaIds.m01,
        operadorEntradaId: usuarioIds.operador,
        operadorSalidaId: null,
        fechaHoraEntrada: haceMediaHora,
        fechaHoraSalida: null,
        observacionEntrada: 'Moto con casco en el manubrio',
        observacionSalida: null,
        estado: ESTADO_MOVIMIENTO.ABIERTO,
      },
    ];
    await writeJsonFile(FILE_PATHS.MOVIMIENTOS, movimientos);
    console.log('✅ Datos de movimientos creados');
  }

  console.log('🚗 Seed completado - Autos Colombia listo');
}
