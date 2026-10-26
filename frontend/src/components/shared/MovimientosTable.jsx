import React, { useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { formatDateTime, formatDuration } from '../../utils/formatters.js';
import { Eye, Car, MapPin, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import './MovimientosTable.css';

export default function MovimientosTable({ movimientos = [], emptyMessage = "No se encontraron movimientos." }) {
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);

  if (!movimientos || movimientos.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="table-container">
      <table className="movimientos-table">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Vehículo</th>
            <th>Celda</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Operador</th>
            <th>Observaciones</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((mov) => {
            const vehiculoDesc = mov.vehiculo
              ? `${mov.vehiculo.marca || ''} ${mov.vehiculo.modelo || ''} (${mov.vehiculo.color || ''})`
              : 'Vehículo desconocido';
            const celdaCodigo = mov.celda?.codigo || mov.celdaCodigo || '-';
            const operadorNombre = mov.operadorEntrada?.nombre || 'Carlos Ramírez';

            // Observaciones preview
            const hasObsEntrada = Boolean(mov.observacionEntrada);
            const hasObsSalida = Boolean(mov.observacionSalida);

            return (
              <tr key={mov.id} onClick={() => setSelectedMovimiento(mov)} className="table-row-clickable">
                <td className="cell-placa">
                  <span className="placa-badge">{mov.vehiculo?.placa || mov.vehiculoPlaca || '-'}</span>
                </td>
                <td className="cell-vehiculo">{vehiculoDesc}</td>
                <td className="cell-celda">
                  <span className="celda-pill">{celdaCodigo}</span>
                </td>
                <td className="cell-fecha">{formatDateTime(mov.fechaHoraEntrada)}</td>
                <td className="cell-fecha">{formatDateTime(mov.fechaHoraSalida)}</td>
                <td className="cell-operador">{operadorNombre}</td>
                <td className="cell-obs">
                  {hasObsEntrada || hasObsSalida ? (
                    <div className="obs-summary">
                      {hasObsEntrada && <span className="obs-tag" title={mov.observacionEntrada}>E: {mov.observacionEntrada.slice(0, 20)}{mov.observacionEntrada.length > 20 ? '...' : ''}</span>}
                      {hasObsSalida && <span className="obs-tag obs-tag--salida" title={mov.observacionSalida}>S: {mov.observacionSalida.slice(0, 20)}{mov.observacionSalida.length > 20 ? '...' : ''}</span>}
                    </div>
                  ) : (
                    <span className="text-muted">Ninguna</span>
                  )}
                </td>
                <td>
                  <Badge status={mov.estado} />
                </td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMovimiento(mov);
                    }}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal de Detalle */}
      <Modal
        isOpen={Boolean(selectedMovimiento)}
        onClose={() => setSelectedMovimiento(null)}
        title="Detalle del Movimiento"
      >
        {selectedMovimiento && (
          <div className="movimiento-detail">
            <div className="detail-header">
              <span className="placa-badge placa-badge--lg">
                {selectedMovimiento.vehiculo?.placa || selectedMovimiento.vehiculoPlaca}
              </span>
              <Badge status={selectedMovimiento.estado} />
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label"><Car size={16} /> Vehículo</span>
                <span className="detail-value">
                  {selectedMovimiento.vehiculo?.marca} {selectedMovimiento.vehiculo?.modelo} - {selectedMovimiento.vehiculo?.color} ({selectedMovimiento.vehiculo?.tipo})
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label"><MapPin size={16} /> Celda Asignada</span>
                <span className="detail-value">
                  {selectedMovimiento.celda?.codigo || selectedMovimiento.celdaCodigo} ({selectedMovimiento.celda?.ubicacion || 'Piso 1'})
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label"><Calendar size={16} /> Fecha y Hora Entrada</span>
                <span className="detail-value">{formatDateTime(selectedMovimiento.fechaHoraEntrada)}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label"><Clock size={16} /> Fecha y Hora Salida</span>
                <span className="detail-value">
                  {selectedMovimiento.fechaHoraSalida
                    ? formatDateTime(selectedMovimiento.fechaHoraSalida)
                    : 'Aún dentro del parqueadero'}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label"><Clock size={16} /> Tiempo de Estancia</span>
                <span className="detail-value">
                  {formatDuration(selectedMovimiento.fechaHoraEntrada, selectedMovimiento.fechaHoraSalida)}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label"><User size={16} /> Operador Entrada</span>
                <span className="detail-value">
                  {selectedMovimiento.operadorEntrada?.nombre || 'Carlos Ramírez'}
                </span>
              </div>

              {selectedMovimiento.operadorSalida && (
                <div className="detail-item">
                  <span className="detail-label"><User size={16} /> Operador Salida</span>
                  <span className="detail-value">{selectedMovimiento.operadorSalida.nombre}</span>
                </div>
              )}
            </div>

            <div className="detail-obs-section">
              <div className="obs-card">
                <span className="obs-header"><MessageSquare size={16} /> Observación de Entrada</span>
                <p className="obs-content">
                  {selectedMovimiento.observacionEntrada || 'Sin observación registrada en el ingreso.'}
                </p>
              </div>

              <div className="obs-card">
                <span className="obs-header"><MessageSquare size={16} /> Observación de Salida</span>
                <p className="obs-content">
                  {selectedMovimiento.observacionSalida || 'Sin observación registrada al momento de la salida.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
