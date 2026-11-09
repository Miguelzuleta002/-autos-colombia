// Datos iniciales (seed) y migraciones para Autos Colombia - Iteración 1 y 2
// Preserva datos existentes y enriquece esquemas de forma idempotente

import { v4 as uuidv4 } from 'uuid';
import { fileExists, readJsonFile, writeJsonFile } from './fileManager.js';
import { FILE_PATHS, ESTADO_CELDA, ESTADO_MOVIMIENTO, ROL_USUARIO, ESTADO_USUARIO } from '../config/constants.js';

/**
 * Ejecuta la carga de datos iniciales o migración idempotente.
 */
export async function seed() {
  const ahora = new Date().toISOString();

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
    operador: '527877e3-a9a4-486d-a367-2b274fecff67',
    admin: '0832007f-e744-4eb7-aa89-9994b35e8974',
  };

  const movimientoIds = {
    mov1: uuidv4(),
    mov2: uuidv4(),
    mov3: uuidv4(),
  };

  // --- 1. Clientes ---
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

  // --- 2. Vehículos ---
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

  // --- 3. Celdas (con migración de atributos de Iteración 2) ---
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
        descripcion: 'Celda estándar para automóvil',
        estado: ESTADO_CELDA.LIBRE,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
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
        descripcion: 'Celda cubierta para automóvil',
        estado: ESTADO_CELDA.LIBRE,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
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
        descripcion: 'Espacio demarcado para motocicleta',
        estado: ESTADO_CELDA.LIBRE,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
      });
    }

    // C-01, C-02 - Piso 1 Zona Camionetas, tipo GENERAL
    celdas.push({
      id: celdaIds.c01,
      codigo: 'C-01',
      ubicacion: 'Piso 1 - Zona Camionetas',
      tipo: 'GENERAL',
      descripcion: 'Celda amplia para camioneta o cualquier vehículo',
      estado: ESTADO_CELDA.LIBRE,
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
    });
    celdas.push({
      id: celdaIds.c02,
      codigo: 'C-02',
      ubicacion: 'Piso 1 - Zona Camionetas',
      tipo: 'GENERAL',
      descripcion: 'Celda amplia para camioneta o cualquier vehículo',
      estado: ESTADO_CELDA.LIBRE,
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
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
  } else {
    // Migración idempotente para enriquecer celdas existentes con campos de Iteración 2
    const celdasExistentes = await readJsonFile(FILE_PATHS.CELDAS);
    let modificado = false;
    for (const c of celdasExistentes) {
      if (!c.descripcion) {
        c.descripcion = `Celda demarcada para vehículos tipo ${c.tipo || 'GENERAL'}`;
        modificado = true;
      }
      if (!c.fechaCreacion) {
        c.fechaCreacion = ahora;
        modificado = true;
      }
      if (!c.fechaActualizacion) {
        c.fechaActualizacion = ahora;
        modificado = true;
      }
    }
    if (modificado) {
      await writeJsonFile(FILE_PATHS.CELDAS, celdasExistentes);
      console.log('🔄 Celdas existentes actualizadas con esquema de Iteración 2');
    }
  }

  // --- 4. Usuarios (con enriquecimiento de Iteración 2) ---
  if (!(await fileExists(FILE_PATHS.USUARIOS))) {
    const usuarios = [
      {
        id: usuarioIds.operador,
        tipoDocumento: 'CC',
        numeroDocumento: '1020304050',
        nombres: 'Carlos',
        apellidos: 'Ramírez',
        nombre: 'Carlos Ramírez',
        correo: 'carlos.ramirez@autoscolombia.com',
        telefono: '3101234567',
        rol: ROL_USUARIO.OPERADOR,
        activo: true,
        estado: ESTADO_USUARIO.ACTIVO,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
      },
      {
        id: usuarioIds.admin,
        tipoDocumento: 'CC',
        numeroDocumento: '1030405060',
        nombres: 'Ana',
        apellidos: 'Morales',
        nombre: 'Ana Morales',
        correo: 'ana.morales@autoscolombia.com',
        telefono: '3209876543',
        rol: ROL_USUARIO.ADMINISTRADOR,
        activo: true,
        estado: ESTADO_USUARIO.ACTIVO,
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
      },
    ];
    await writeJsonFile(FILE_PATHS.USUARIOS, usuarios);
    console.log('✅ Datos de usuarios creados');
  } else {
    // Migración idempotente para usuarios existentes de Iteración 1
    const usuariosExistentes = await readJsonFile(FILE_PATHS.USUARIOS);
    let modificado = false;
    for (const u of usuariosExistentes) {
      if (!u.tipoDocumento) {
        u.tipoDocumento = 'CC';
        modificado = true;
      }
      if (!u.numeroDocumento) {
        u.numeroDocumento = u.nombre?.includes('Ana') ? '1030405060' : '1020304050';
        modificado = true;
      }
      if (!u.nombres) {
        const partes = (u.nombre || '').split(' ');
        u.nombres = partes[0] || 'Usuario';
        u.apellidos = partes.slice(1).join(' ') || '';
        modificado = true;
      }
      if (!u.correo) {
        const base = u.nombres.toLowerCase();
        u.correo = `${base}.${(u.apellidos || 'autos').toLowerCase().split(' ')[0]}@autoscolombia.com`;
        modificado = true;
      }
      if (!u.telefono) {
        u.telefono = '3101234567';
        modificado = true;
      }
      if (u.rol === 'ADMIN') {
        u.rol = ROL_USUARIO.ADMINISTRADOR;
        modificado = true;
      }
      if (!u.estado) {
        u.estado = u.activo ? ESTADO_USUARIO.ACTIVO : ESTADO_USUARIO.INACTIVO;
        modificado = true;
      }
      if (!u.fechaCreacion) {
        u.fechaCreacion = ahora;
        modificado = true;
      }
      if (!u.fechaActualizacion) {
        u.fechaActualizacion = ahora;
        modificado = true;
      }
    }
    if (modificado) {
      await writeJsonFile(FILE_PATHS.USUARIOS, usuariosExistentes);
      console.log('🔄 Usuarios existentes enriquecidos con esquema de Iteración 2');
    }
  }

  // --- 5. Auditorías de celda (Iteración 2) ---
  if (!(await fileExists(FILE_PATHS.AUDITORIAS_CELDA))) {
    const auditorias = [
      {
        id: uuidv4(),
        celdaId: '', // se vincula dinámicamente si existe B-05
        codigoCelda: 'B-05',
        accion: 'MANTENIMIENTO_INICIO',
        usuarioResponsableId: usuarioIds.admin,
        usuarioResponsableNombre: 'Ana Morales',
        fecha: ahora,
        motivo: 'Demarcación y pintura de señalización',
        detalle: 'Pintura desgastada en líneas divisorias',
      },
    ];

    // Vincular id real de B-05 si existe
    if (await fileExists(FILE_PATHS.CELDAS)) {
      const celdas = await readJsonFile(FILE_PATHS.CELDAS);
      const b05 = celdas.find((c) => c.codigo === 'B-05');
      if (b05) {
        auditorias[0].celdaId = b05.id;
      }
    }

    await writeJsonFile(FILE_PATHS.AUDITORIAS_CELDA, auditorias);
    console.log('✅ Datos de auditoría de celdas creados');
  }

  // --- 6. Movimientos (Iteración 1) ---
  if (!(await fileExists(FILE_PATHS.MOVIMIENTOS))) {
    const ahoraMs = Date.now();
    const haceUnaHora = new Date(ahoraMs - 60 * 60 * 1000).toISOString();
    const haceTresHoras = new Date(ahoraMs - 3 * 60 * 60 * 1000).toISOString();
    const haceDosHoras = new Date(ahoraMs - 2 * 60 * 60 * 1000).toISOString();
    const haceMediaHora = new Date(ahoraMs - 30 * 60 * 1000).toISOString();

    const movimientos = [
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
