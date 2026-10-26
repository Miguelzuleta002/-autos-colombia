import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import SearchInput from '../../components/ui/SearchInput.jsx';
import VehiculoInfo from '../../components/shared/VehiculoInfo.jsx';
import CeldaSelector from '../../components/shared/CeldaSelector.jsx';
import Alert from '../../components/ui/Alert.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { LogIn, CheckCircle2, AlertCircle, RefreshCw, Car, MapPin, Calendar, User } from 'lucide-react';
import './RegistrarEntradaPage.css';

export default function RegistrarEntradaPage() {
  const [placaSearch, setPlacaSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [vehiculo, setVehiculo] = useState(null);
  const [vehiculoError, setVehiculoError] = useState(null);

  const [celdasLibres, setCeldasLibres] = useState([]);
  const [loadingCeldas, setLoadingCeldas] = useState(false);
  const [selectedCelda, setSelectedCelda] = useState(null);

  const [observacion, setObservacion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { type, message }

  // Cargar celdas libres al montar o refrescar
  const loadCeldas = async () => {
    setLoadingCeldas(true);
    try {
      const data = await api.getCeldas('LIBRE');
      setCeldasLibres(data || []);
    } catch (err) {
      console.error('Error cargando celdas:', err);
    } finally {
      setLoadingCeldas(false);
    }
  };

  useEffect(() => {
    loadCeldas();
  }, []);

  // Buscar vehículo por placa
  const handleSearchVehiculo = async () => {
    if (!placaSearch.trim()) return;

    setSearching(true);
    setVehiculo(null);
    setVehiculoError(null);
    setNotification(null);

    try {
      const results = await api.searchVehiculos(placaSearch.trim());
      const cleanPlaca = placaSearch.trim().toUpperCase();
      const match = results.find((v) => v.placa.toUpperCase() === cleanPlaca) || results[0];

      if (!match) {
        setVehiculoError(`No se encontró ningún vehículo registrado con la placa "${cleanPlaca}".`);
        return;
      }

      if (!match.activo) {
        setVehiculoError(`El vehículo con placa "${match.placa}" se encuentra INACTIVO en el sistema.`);
        return;
      }

      // Validar si ya tiene movimiento abierto
      const abiertos = await api.getMovimientosAbiertos();
      const yaAdentro = abiertos.find(
        (m) => (m.vehiculo?.placa || m.vehiculoPlaca || '').toUpperCase() === match.placa.toUpperCase()
      );

      if (yaAdentro) {
        const celdaActual = yaAdentro.celda?.codigo || yaAdentro.celdaCodigo || 'asignada';
        setVehiculoError(`El vehículo "${match.placa}" ya tiene una entrada abierta en la celda ${celdaActual}.`);
        return;
      }

      setVehiculo(match);
    } catch (err) {
      setVehiculoError(err.message || 'Error al buscar el vehículo.');
    } finally {
      setSearching(false);
    }
  };

  // Registrar entrada
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehiculo) {
      setNotification({ type: 'error', message: 'Debe buscar y seleccionar un vehículo válido.' });
      return;
    }
    if (!selectedCelda) {
      setNotification({ type: 'warning', message: 'Debe seleccionar una celda libre.' });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await api.registrarEntrada({
        placa: vehiculo.placa,
        celdaId: selectedCelda.id,
        observacionEntrada: observacion.trim() || undefined,
      });

      setNotification({
        type: 'success',
        message: `¡Entrada registrada con éxito para el vehículo ${vehiculo.placa} en la celda ${selectedCelda.codigo}!`,
      });

      // Reset form
      setVehiculo(null);
      setSelectedCelda(null);
      setPlacaSearch('');
      setObservacion('');
      // Reload free cells
      loadCeldas();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Ocurrió un error al registrar la entrada.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registrar-entrada-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registrar Entrada de Vehículo</h1>
          <p className="page-subtitle">Asignación de celda e ingreso de vehículos con mensualidad activa</p>
        </div>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="entrada-layout">
        {/* Columna Izquierda: Formulario paso a paso */}
        <div className="entrada-form-col">
          {/* Paso 1: Búsqueda de Vehículo */}
          <div className="card entrada-card">
            <div className="step-badge">Paso 1</div>
            <h2 className="card-section-title">Buscar Vehículo por Placa</h2>
            <p className="card-section-desc">Ingrese la placa del vehículo para verificar registro y estado activo.</p>

            <div className="search-box-row">
              <SearchInput
                value={placaSearch}
                onChange={(val) => {
                  setPlacaSearch(val.toUpperCase());
                  if (vehiculo) setVehiculo(null);
                  if (vehiculoError) setVehiculoError(null);
                }}
                onSearch={handleSearchVehiculo}
                placeholder="Ej: ABC123"
                disabled={searching}
              />
            </div>

            {searching && <LoadingSpinner />}

            {vehiculoError && (
              <div className="inline-alert inline-alert--error">
                <AlertCircle size={18} />
                <span>{vehiculoError}</span>
              </div>
            )}

            {vehiculo && (
              <div className="vehiculo-found-box">
                <div className="found-header">
                  <CheckCircle2 size={18} className="text-success" />
                  <span>Vehículo validado y listo para ingreso</span>
                </div>
                <VehiculoInfo vehiculo={vehiculo} />
              </div>
            )}
          </div>

          {/* Paso 2: Selector de Celda */}
          <div className="card entrada-card">
            <div className="step-header">
              <div>
                <div className="step-badge">Paso 2</div>
                <h2 className="card-section-title">Seleccionar Celda Libre</h2>
                <p className="card-section-desc">Escoja una celda disponible para ubicar el vehículo.</p>
              </div>
              <button
                type="button"
                className="btn-icon-refresh"
                onClick={loadCeldas}
                title="Refrescar celdas"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {loadingCeldas ? (
              <LoadingSpinner />
            ) : (
              <CeldaSelector
                celdas={celdasLibres}
                selectedId={selectedCelda?.id}
                onSelect={(celda) => setSelectedCelda(celda)}
              />
            )}
          </div>

          {/* Paso 3: Observaciones */}
          <div className="card entrada-card">
            <div className="step-badge">Paso 3</div>
            <h2 className="card-section-title">Observaciones de Entrada (Opcional)</h2>
            <p className="card-section-desc">Registre novedades visibles (rayones, golpes, accesorios especiales).</p>

            <textarea
              className="textarea-obs"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: Rayón leve en puerta del copiloto, sin antena exterior..."
              rows={3}
              maxLength={300}
            />
            <div className="char-counter">{observacion.length} / 300 caracteres</div>
          </div>
        </div>

        {/* Columna Derecha: Resumen de Confirmación */}
        <div className="entrada-summary-col">
          <div className="card summary-sticky-card">
            <h2 className="summary-title">Resumen de Registro</h2>
            <div className="summary-divider" />

            <div className="summary-list">
              <div className="summary-row">
                <span className="summary-label"><Car size={16} /> Vehículo</span>
                <span className="summary-val">
                  {vehiculo ? `${vehiculo.placa} (${vehiculo.marca})` : <span className="text-muted">Por seleccionar</span>}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label"><MapPin size={16} /> Celda</span>
                <span className="summary-val">
                  {selectedCelda ? (
                    <span className="celda-pill">{selectedCelda.codigo} - {selectedCelda.tipo}</span>
                  ) : (
                    <span className="text-muted">Por seleccionar</span>
                  )}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label"><Calendar size={16} /> Fecha y Hora</span>
                <span className="summary-val">Automática (Servidor)</span>
              </div>

              <div className="summary-row">
                <span className="summary-label"><User size={16} /> Operador</span>
                <span className="summary-val">Carlos Ramírez (Demo)</span>
              </div>

              {observacion.trim() && (
                <div className="summary-row-obs">
                  <span className="summary-label">Observación:</span>
                  <p className="summary-obs-text">"{observacion.trim()}"</p>
                </div>
              )}
            </div>

            <button
              className="btn-submit-entrada"
              onClick={handleSubmit}
              disabled={!vehiculo || !selectedCelda || submitting}
            >
              <LogIn size={20} />
              <span>{submitting ? 'Registrando...' : 'Registrar Entrada'}</span>
            </button>

            <p className="summary-note">
              Al confirmar, la celda cambiará automáticamente a estado <strong>OCUPADA</strong> y se generará el movimiento abierto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
