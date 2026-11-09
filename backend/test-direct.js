// Suite completa de pruebas directas para Autos Colombia - Iteración 1 e Iteración 2
// Ejecuta verificaciones de reglas de negocio, persistencia JSON y regresión completa

import * as movimientoService from './src/application/movimiento.service.js';
import * as dashboardService from './src/application/dashboard.service.js';
import * as usuarioService from './src/application/usuario.service.js';
import * as celdaService from './src/application/celda.service.js';
import * as vehiculoRepo from './src/persistence/repositories/vehiculo.repository.js';
import * as celdaRepo from './src/persistence/repositories/celda.repository.js';
import * as usuarioRepo from './src/persistence/repositories/usuario.repository.js';
import * as auditoriaRepo from './src/persistence/repositories/auditoriaCelda.repository.js';
import { seed } from './src/persistence/seed.js';
import { ValidationError, NotFoundError, ConflictError, ForbiddenError } from './src/domain/errors.js';
import { ROL_USUARIO, ESTADO_CELDA, ESTADO_USUARIO } from './src/config/constants.js';
import { setActiveDemoUserId } from './src/api/middlewares/auth.js';

async function runAllTests() {
  console.log('🧪 Iniciando verificación completa de Autos Colombia (Iteración 1 + Iteración 2)...\n');

  // Asegurar seed y migración inicial
  await seed();

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  try {
    // ==========================================
    // 1. SESIÓN Y USUARIOS (ITERACIÓN 2)
    // ==========================================
    console.log('--- 1. GESTIÓN DE USUARIOS Y ROLES (ITERACIÓN 2: HU07 - HU10) ---');

    // 1.1 Listar usuarios
    const usuarios = await usuarioService.obtenerTodos();
    assert(usuarios.length >= 2, 'Listar usuarios retorna usuarios registrados (RF09)');

    const adminUser = usuarios.find((u) => u.rol === ROL_USUARIO.ADMINISTRADOR || u.rol === 'ADMIN');
    const operadorUser = usuarios.find((u) => u.rol === ROL_USUARIO.OPERADOR);
    assert(Boolean(adminUser), 'Existe usuario Administrador en el sistema');
    assert(Boolean(operadorUser), 'Existe usuario Operador en el sistema');

    // Configurar admin como demo para pruebas
    setActiveDemoUserId(adminUser.id);

    // 1.2 Búsqueda y filtros de usuarios
    const filtradosPorRol = await usuarioService.obtenerTodos({ rol: 'ADMINISTRADOR' });
    assert(
      filtradosPorRol.every((u) => u.rol === ROL_USUARIO.ADMINISTRADOR || u.rol === 'ADMIN'),
      'Filtro por rol ADMINISTRADOR funciona correctamente (RF10)'
    );

    const filtradosPorBusqueda = await usuarioService.obtenerTodos({ busqueda: 'Carlos' });
    assert(
      filtradosPorBusqueda.some((u) => (u.nombre || u.nombres).includes('Carlos')),
      'Búsqueda por nombre de usuario funciona correctamente (RF10)'
    );

    // 1.3 Consultar detalle de usuario
    const detalleUsuario = await usuarioService.obtenerPorId(adminUser.id);
    assert(detalleUsuario.id === adminUser.id && Boolean(detalleUsuario.correo), 'Consulta de detalle de usuario (RF11)');

    // 1.4 Registrar nuevo usuario válido
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    const nuevoUsuarioData = {
      tipoDocumento: 'CC',
      numeroDocumento: `987654${randomSuffix}`,
      nombres: 'Prueba',
      apellidos: 'Tester',
      correo: `prueba.tester${randomSuffix}@autoscolombia.com`,
      telefono: '3159998877',
      rol: 'OPERADOR',
    };
    const nuevoUsuario = await usuarioService.registrarUsuario(nuevoUsuarioData);
    assert(nuevoUsuario.activo === true && nuevoUsuario.estado === 'ACTIVO', 'Registrar usuario válido con estado ACTIVO (RF12)');

    // 1.5 Rechazar documento duplicado
    let errDocDuplicado = false;
    try {
      await usuarioService.registrarUsuario({
        ...nuevoUsuarioData,
        correo: `otro.correo${randomSuffix}@autoscolombia.com`,
      });
    } catch (e) {
      errDocDuplicado = e instanceof ConflictError;
    }
    assert(errDocDuplicado, 'Rechaza registro con documento duplicado (RF15)');

    // 1.6 Rechazar correo duplicado
    let errCorreoDuplicado = false;
    try {
      await usuarioService.registrarUsuario({
        ...nuevoUsuarioData,
        numeroDocumento: `555555${randomSuffix}`,
      });
    } catch (e) {
      errCorreoDuplicado = e instanceof ConflictError;
    }
    assert(errCorreoDuplicado, 'Rechaza registro con correo duplicado (RF15)');

    // 1.7 Actualizar usuario y rol
    const usuarioEditado = await usuarioService.actualizarUsuario(nuevoUsuario.id, {
      telefono: '3110001122',
      rol: 'ADMINISTRADOR',
    });
    assert(
      usuarioEditado.telefono === '3110001122' && usuarioEditado.rol === 'ADMINISTRADOR',
      'Actualizar información y rol de usuario (RF13)'
    );

    // 1.8 Desactivar y activar usuario
    const usuarioDesactivado = await usuarioService.cambiarEstadoUsuario(
      nuevoUsuario.id,
      { activo: false },
      adminUser
    );
    assert(!usuarioDesactivado.activo && usuarioDesactivado.estado === 'INACTIVO', 'Desactivar usuario (RF14)');

    const usuarioReactivado = await usuarioService.cambiarEstadoUsuario(
      nuevoUsuario.id,
      { activo: true },
      adminUser
    );
    assert(usuarioReactivado.activo && usuarioReactivado.estado === 'ACTIVO', 'Reactivar usuario a ACTIVO (RF14)');

    // 1.9 Proteger al usuario demo actual contra desactivación
    let errProteccionDemo = false;
    try {
      await usuarioService.cambiarEstadoUsuario(adminUser.id, { activo: false }, adminUser);
    } catch (e) {
      errProteccionDemo = e instanceof ConflictError;
    }
    assert(errProteccionDemo, 'Impide desactivar al usuario de demostración actual en uso (RF16)');

    // 1.10 Proteger al último Administrador activo
    // Degradamos al usuario de prueba de vuelta a Operador
    await usuarioService.actualizarUsuario(nuevoUsuario.id, { rol: 'OPERADOR' });
    let errProteccionUltimoAdmin = false;
    try {
      // Intentar retirar rol de admin a Ana Morales (siendo la única administradora activa)
      await usuarioService.actualizarUsuario(adminUser.id, { rol: 'OPERADOR' });
    } catch (e) {
      errProteccionUltimoAdmin = e instanceof ConflictError;
    }
    assert(errProteccionUltimoAdmin, 'Impide degradar o quitar rol al último Administrador activo (RF16)');

    // ==========================================
    // 2. GESTIÓN DE CELDAS (ITERACIÓN 2)
    // ==========================================
    console.log('\n--- 2. GESTIÓN Y MANTENIMIENTO DE CELDAS (ITERACIÓN 2: HU11 - HU14) ---');

    // 2.1 Listar y filtrar celdas
    const todasCeldas = await celdaService.obtenerTodas();
    assert(todasCeldas.length >= 20, 'Listar todas las celdas del parqueadero (RF17)');

    const celdasMotos = await celdaService.obtenerTodas({ tipo: 'MOTO' });
    assert(
      celdasMotos.length > 0 && celdasMotos.every((c) => c.tipo === 'MOTO'),
      'Filtrar celdas por tipo MOTO (RF18)'
    );

    const celdasLibres = await celdaService.obtenerTodas({ estado: 'LIBRE' });
    assert(
      celdasLibres.length > 0 && celdasLibres.every((c) => c.estado === 'LIBRE'),
      'Filtrar celdas por estado LIBRE (RF18)'
    );

    // 2.2 Registrar nueva celda (inicia en estado LIBRE)
    const codCeldaNueva = `T-${randomSuffix.toString().slice(0, 2)}`;
    const celdaNueva = await celdaService.registrarCelda(
      {
        codigo: codCeldaNueva,
        ubicacion: 'Piso 2 - Zona Test',
        tipo: 'CARRO',
        descripcion: 'Celda creada durante prueba automatizada',
      },
      adminUser
    );
    assert(
      celdaNueva.codigo === codCeldaNueva && celdaNueva.estado === 'LIBRE',
      'Registrar nueva celda que inicia en estado LIBRE (RF20)'
    );

    // 2.3 Rechazar código de celda duplicado
    let errCodDuplicado = false;
    try {
      await celdaService.registrarCelda(
        {
          codigo: codCeldaNueva,
          ubicacion: 'Otra zona',
          tipo: 'CARRO',
        },
        adminUser
      );
    } catch (e) {
      errCodDuplicado = e instanceof ConflictError;
    }
    assert(errCodDuplicado, 'Rechaza registro con código de celda duplicado (RF20)');

    // 2.4 Editar datos de celda
    const celdaEditada = await celdaService.actualizarCelda(
      celdaNueva.id,
      {
        ubicacion: 'Piso 2 - Zona Renovada',
        descripcion: 'Descripción actualizada',
      },
      adminUser
    );
    assert(
      celdaEditada.ubicacion === 'Piso 2 - Zona Renovada',
      'Actualizar información general de celda (RF21)'
    );

    // 2.5 Enviar celda libre a mantenimiento (RF22)
    const celdaEnMantenimiento = await celdaService.enviarAMantenimiento(
      celdaNueva.id,
      {
        motivo: 'Demarcación y pintura de líneas',
        detalle: 'Pintura reflectiva en bordes',
      },
      adminUser
    );
    assert(
      celdaEnMantenimiento.estado === 'MANTENIMIENTO',
      'Enviar celda libre a estado MANTENIMIENTO con motivo registrado (RF22)'
    );

    // 2.6 Habilitar celda en mantenimiento (RF23)
    const celdaHabilitada = await celdaService.habilitarCelda(
      celdaNueva.id,
      { motivo: 'Trabajo de pintura concluido con éxito' },
      adminUser
    );
    assert(
      celdaHabilitada.estado === 'LIBRE',
      'Habilitar celda en mantenimiento volviéndola a LIBRE (RF23)'
    );

    // 2.7 Auditoría histórica registrada para la celda (RF27)
    const detalleConAuditoria = await celdaService.obtenerPorId(celdaNueva.id);
    assert(
      detalleConAuditoria.historialAuditoria && detalleConAuditoria.historialAuditoria.length >= 3,
      'Trazabilidad histórica de auditoría registrada (creación, edición, mantenimiento) (RF27)'
    );

    // ==========================================
    // 3. COMPATIBILIDAD VEHÍCULO - CELDA (RF25)
    // ==========================================
    console.log('\n--- 3. REGLA DE COMPATIBILIDAD VEHÍCULO Y CELDA (RF25) ---');

    // Celda de tipo MOTO
    const celdaMoto = celdasMotos.find((c) => c.estado === 'LIBRE');
    // Vehículo tipo CARRO (JKL012)
    const vehiculoCarro = await vehiculoRepo.findByPlaca('JKL012');

    let errIncompatibilidad = false;
    try {
      await movimientoService.registrarEntrada({
        placa: vehiculoCarro.placa,
        celdaId: celdaMoto.id,
      });
    } catch (e) {
      errIncompatibilidad = e instanceof ValidationError;
    }
    assert(errIncompatibilidad, 'Rechaza entrada de vehículo CARRO en celda MOTO por incompatibilidad (RF25)');

    // ==========================================
    // 4. REGRESIÓN DE ITERACIÓN 1 (HU01 - HU06)
    // ==========================================
    console.log('\n--- 4. REGRESIÓN DE ITERACIÓN 1 (ENTRADAS, SALIDAS Y PERSISTENCIA) ---');

    // 4.1 Dashboard summary
    const summary = await dashboardService.obtenerResumen();
    assert(summary.totalCeldas >= 20 && typeof summary.porcentajeOcupacion === 'number', 'Cálculo de métricas del dashboard');

    // 4.2 Celda libre compatible para CARRO
    const celdaCarroLibre = (await celdaService.obtenerTodas({ tipo: 'CARRO', estado: 'LIBRE' }))[0];

    // 4.3 Registrar entrada válida
    const entradaOk = await movimientoService.registrarEntrada({
      placa: 'JKL012',
      celdaId: celdaCarroLibre.id,
      observacionEntrada: 'Entrada de prueba: sin abolladuras',
      operadorId: adminUser.id,
    });
    assert(entradaOk.estado === 'ABIERTO', 'Registro de entrada crea movimiento ABIERTO (RF01)');
    assert(entradaOk.observacionEntrada === 'Entrada de prueba: sin abolladuras', 'Observación de entrada preservada (RF06)');

    // Verificar que celda pasa a OCUPADA
    const celdaOcupadaVerif = await celdaRepo.findById(celdaCarroLibre.id);
    assert(celdaOcupadaVerif.estado === 'OCUPADA', 'Celda asignada pasa automáticamente a OCUPADA (RF04)');

    // 4.4 Impide enviar a mantenimiento celda OCUPADA
    let errMantenimientoOcupada = false;
    try {
      await celdaService.enviarAMantenimiento(celdaCarroLibre.id, { motivo: 'Mantenimiento indebido' }, adminUser);
    } catch (e) {
      errMantenimientoOcupada = e instanceof ConflictError;
    }
    assert(errMantenimientoOcupada, 'Impide enviar a mantenimiento una celda OCUPADA (RF22)');

    // 4.5 Impide modificar tipo/compatibilidad de celda OCUPADA
    let errCambioTipoOcupada = false;
    try {
      await celdaService.actualizarCelda(celdaCarroLibre.id, { tipo: 'MOTO' }, adminUser);
    } catch (e) {
      errCambioTipoOcupada = e instanceof ConflictError;
    }
    assert(errCambioTipoOcupada, 'Impide cambiar tipo de compatibilidad a una celda OCUPADA (RF21)');

    // 4.6 Impide liberar manualmente celda OCUPADA desde módulo administrativo
    let errLiberarManual = false;
    try {
      await celdaService.habilitarCelda(celdaCarroLibre.id, {}, adminUser);
    } catch (e) {
      errLiberarManual = e instanceof ConflictError;
    }
    assert(errLiberarManual, 'Impide liberar manualmente una celda OCUPADA desde módulo de celdas (RF23)');

    // 4.7 Impide doble entrada con el mismo vehículo
    let errDobleEntrada = false;
    try {
      const otraLibre = (await celdaService.obtenerTodas({ estado: 'LIBRE' }))[0];
      await movimientoService.registrarEntrada({
        placa: 'JKL012',
        celdaId: otraLibre.id,
      });
    } catch (e) {
      errDobleEntrada = e instanceof ConflictError;
    }
    assert(errDobleEntrada, 'Impide entrada duplicada de vehículo ya dentro (RF08)');

    // 4.8 Consultar vehículos dentro
    const adentro = await movimientoService.obtenerAbiertos();
    assert(adentro.some((m) => (m.vehiculo?.placa || m.vehiculoPlaca) === 'JKL012'), 'Vehículo aparece en consulta de vehículos dentro (RF02)');

    // 4.9 Registrar salida, liberar celda y observaciones independientes
    const salidaOk = await movimientoService.registrarSalida(entradaOk.id, {
      observacionSalida: 'Salida de prueba: entrega conforme al cliente',
      operadorId: adminUser.id,
    });
    assert(salidaOk.estado === 'CERRADO', 'Movimiento pasa a estado CERRADO al registrar salida (RF03)');
    assert(
      salidaOk.observacionEntrada === 'Entrada de prueba: sin abolladuras' &&
        salidaOk.observacionSalida === 'Salida de prueba: entrega conforme al cliente',
      'Observaciones de entrada y salida son independientes y no se sobreescriben (RF06)'
    );

    // Celda vuelve a estar LIBRE
    const celdaLiberadaVerif = await celdaRepo.findById(celdaCarroLibre.id);
    assert(celdaLiberadaVerif.estado === 'LIBRE', 'Celda vuelve automáticamente a estado LIBRE tras salida (RF04)');

    // 4.10 Historial de movimientos con filtros
    const historial = await movimientoService.obtenerTodos({ placa: 'JKL012', estado: 'CERRADO' });
    assert(historial.length >= 1, 'Historial filtra movimientos por placa y estado CERRADO (RF05)');

    console.log('\n============================================================');
    console.log(`TOTAL DE PRUEBAS AUTOMATIZADAS: ${passed} PASADAS, ${failed} FALLADAS`);
    console.log('============================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Error crítico durante las pruebas:', err);
    process.exit(1);
  }
}

runAllTests();
