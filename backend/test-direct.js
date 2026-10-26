import * as movimientoService from './src/application/movimiento.service.js';
import * as dashboardService from './src/application/dashboard.service.js';
import * as vehiculoRepo from './src/persistence/repositories/vehiculo.repository.js';
import * as celdaRepo from './src/persistence/repositories/celda.repository.js';
import * as movimientoRepo from './src/persistence/repositories/movimiento.repository.js';
import { seed } from './src/persistence/seed.js';
import { ValidationError, NotFoundError, ConflictError } from './src/domain/errors.js';

async function runDirectTests() {
  console.log('🧪 Iniciando verificación directa del backend y reglas de negocio...\n');

  // Asegurar que seed esté cargado
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
    // 1. Dashboard Summary
    console.log('--- 1. DASHBOARD & MÉTRICAS ---');
    const summary = await dashboardService.obtenerResumen();
    assert(summary.totalCeldas >= 20, 'Total de celdas es al menos 20', `Obtenido: ${summary.totalCeldas}`);
    assert(summary.celdasLibres > 0, 'Existen celdas libres', `Libres: ${summary.celdasLibres}`);
    assert(summary.celdasMantenimiento >= 1, 'Registra celda en mantenimiento (B-05)');
    assert(typeof summary.porcentajeOcupacion === 'number', 'Porcentaje de ocupación calculado');

    // 2. Consulta y validación de vehículos
    console.log('\n--- 2. VEHÍCULOS ---');
    const vehiculoActivo = await vehiculoRepo.findByPlaca('DEF456');
    assert(Boolean(vehiculoActivo) && vehiculoActivo.activo === true, 'Vehículo DEF456 existe y está activo');

    const vehiculoInactivo = await vehiculoRepo.findByPlaca('VWX234');
    assert(Boolean(vehiculoInactivo) && vehiculoInactivo.activo === false, 'Vehículo VWX234 está inactivo');

    // 3. Consulta de celdas libres
    console.log('\n--- 3. CELDAS DISPONIBLES ---');
    const celdasLibres = await celdaRepo.findByEstado('LIBRE');
    assert(celdasLibres.length > 0, 'Celdas libres disponibles para asignación');
    const celdaPrueba = celdasLibres[0];

    // 4. Validaciones de Entrada
    console.log('\n--- 4. VALIDACIONES DE ENTRADA (REGLAS DE NEGOCIO) ---');
    // Error placa inexistente
    let errorInexistente = false;
    try {
      await movimientoService.registrarEntrada({ placa: 'XYZ999', celdaId: celdaPrueba.id });
    } catch (err) {
      errorInexistente = err instanceof NotFoundError;
    }
    assert(errorInexistente, 'Rechaza placa inexistente con NotFoundError');

    // Error vehículo inactivo
    let errorInactivo = false;
    try {
      await movimientoService.registrarEntrada({ placa: 'VWX234', celdaId: celdaPrueba.id });
    } catch (err) {
      errorInactivo = err instanceof ValidationError;
    }
    assert(errorInactivo, 'Rechaza vehículo inactivo con ValidationError');

    // 5. Registrar Entrada Válida
    console.log('\n--- 5. REGISTRAR ENTRADA VÁLIDA ---');
    const entradaResult = await movimientoService.registrarEntrada({
      placa: 'DEF456',
      celdaId: celdaPrueba.id,
      observacionEntrada: 'Golpe leve en paragolpes trasero derecho',
    });
    assert(entradaResult.estado === 'ABIERTO', 'Movimiento registrado con estado ABIERTO');
    assert(entradaResult.vehiculo.placa === 'DEF456', 'Vehículo asociado correctamente');
    assert(entradaResult.celda.id === celdaPrueba.id, 'Celda asignada correctamente');
    assert(entradaResult.observacionEntrada === 'Golpe leve en paragolpes trasero derecho', 'Observación de entrada guardada');
    assert(Boolean(entradaResult.operadorEntrada), 'Operador de entrada registrado');

    // Celda debe estar ahora OCUPADA
    const celdaOcupada = await celdaRepo.findById(celdaPrueba.id);
    assert(celdaOcupada.estado === 'OCUPADA', 'Celda cambió automáticamente a OCUPADA');

    // Error: Doble entrada con el mismo vehículo
    let errorDobleEntrada = false;
    try {
      await movimientoService.registrarEntrada({ placa: 'DEF456', celdaId: celdasLibres[1].id });
    } catch (err) {
      errorDobleEntrada = err instanceof ConflictError;
    }
    assert(errorDobleEntrada, 'Impide doble entrada de vehículo ya dentro con ConflictError');

    // Error: Asignar celda ya ocupada
    let errorCeldaOcupada = false;
    try {
      await movimientoService.registrarEntrada({ placa: 'GHI789', celdaId: celdaPrueba.id });
    } catch (err) {
      errorCeldaOcupada = err instanceof ConflictError;
    }
    assert(errorCeldaOcupada, 'Impide asignar una celda que ya está OCUPADA');

    // 6. Consultar vehículos dentro
    console.log('\n--- 6. CONSULTAR VEHÍCULOS DENTRO ---');
    const adentro = await movimientoService.obtenerAbiertos();
    const vehiculoAdentro = adentro.find((m) => m.vehiculo.placa === 'DEF456');
    assert(Boolean(vehiculoAdentro), 'El vehículo DEF456 aparece en la lista de vehículos dentro');

    // 7. Registrar Salida
    console.log('\n--- 7. REGISTRAR SALIDA Y LIBERAR CELDA ---');
    const salidaResult = await movimientoService.registrarSalida(entradaResult.id, {
      observacionSalida: 'Vehículo retirado por su propietario sin novedades',
    });
    assert(salidaResult.estado === 'CERRADO', 'Movimiento cambia a estado CERRADO');
    assert(Boolean(salidaResult.fechaHoraSalida), 'Genera fecha y hora de salida oficial');
    assert(
      salidaResult.observacionEntrada === 'Golpe leve en paragolpes trasero derecho',
      'Observación de entrada se preserva intacta (no sobrescrita)'
    );
    assert(
      salidaResult.observacionSalida === 'Vehículo retirado por su propietario sin novedades',
      'Observación de salida guardada en campo independiente'
    );

    // Celda debe estar nuevamente LIBRE
    const celdaLiberada = await celdaRepo.findById(celdaPrueba.id);
    assert(celdaLiberada.estado === 'LIBRE', 'Celda vuelve automáticamente a estado LIBRE');

    // Error: reintentar salida en un movimiento ya cerrado
    let errorSalidaCerrada = false;
    try {
      await movimientoService.registrarSalida(entradaResult.id, {});
    } catch (err) {
      errorSalidaCerrada = err instanceof ConflictError;
    }
    assert(errorSalidaCerrada, 'Impide salida en un movimiento que ya está CERRADO');

    // 8. Consultar Historial y Filtros
    console.log('\n--- 8. HISTORIAL Y FILTROS ---');
    const historialPlaca = await movimientoService.obtenerTodos({ placa: 'DEF456' });
    assert(historialPlaca.length >= 1, 'Historial filtra correctamente por placa');

    const historialEstado = await movimientoService.obtenerTodos({ estado: 'CERRADO' });
    const todosCerrados = historialEstado.every((m) => m.estado === 'CERRADO');
    assert(todosCerrados && historialEstado.length > 0, 'Historial filtra correctamente por estado CERRADO');

    console.log('\n=============================================');
    console.log(`TOTAL DE PRUEBAS: ${passed} PASADAS, ${failed} FALLADAS`);
    console.log('=============================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (e) {
    console.error('Error no controlado en la prueba:', e);
    process.exit(1);
  }
}

runDirectTests();
