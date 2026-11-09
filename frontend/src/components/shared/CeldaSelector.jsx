import React from 'react';
import { CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import './CeldaSelector.css';

const typeColorMap = {
  CARRO: 'celda--car',
  MOTO: 'celda--moto',
  CAMIONETA: 'celda--camioneta',
  GENERAL: 'celda--general',
};

export default function CeldaSelector({ celdas, selectedId, onSelect, vehiculoTipo = null }) {
  if (!celdas || celdas.length === 0) {
    return (
      <div className="celda-selector__empty">
        No hay celdas libres disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="celda-selector">
      {celdas.map((celda) => {
        const isSelected = selectedId === celda.id;
        const typeClass = typeColorMap[celda.tipo] || 'celda--general';

        // Evaluar compatibilidad con el vehículo (RF25)
        const esCompatible =
          !vehiculoTipo ||
          celda.tipo === 'GENERAL' ||
          celda.tipo === vehiculoTipo;

        return (
          <button
            key={celda.id}
            className={`celda-card ${typeClass} ${isSelected ? 'celda-card--selected' : ''} ${
              !esCompatible ? 'celda-card--incompatible' : ''
            }`}
            onClick={() => onSelect(celda, esCompatible)}
            type="button"
            title={
              !esCompatible
                ? `Incompatible con vehículo tipo ${vehiculoTipo} (Celda exclusiva para ${celda.tipo})`
                : `Celda ${celda.codigo} (${celda.tipo}) - Disponible`
            }
          >
            {isSelected && <CheckCircle size={18} className="celda-card__check" />}
            {!esCompatible && vehiculoTipo && (
              <span className="incompatible-tag" title="No compatible con el vehículo">
                <AlertCircle size={11} /> No compatible
              </span>
            )}
            <span className="celda-card__code">{celda.codigo}</span>
            <span className="celda-card__location">
              <MapPin size={12} />
              {celda.ubicacion || 'Sin ubicación'}
            </span>
            <span className="celda-card__type">{celda.tipo}</span>
          </button>
        );
      })}
    </div>
  );
}
