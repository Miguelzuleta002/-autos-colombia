import { CheckCircle, MapPin } from 'lucide-react';
import './CeldaSelector.css';

const typeColorMap = {
  CARRO: 'celda--car',
  MOTO: 'celda--moto',
  GENERAL: 'celda--general',
};

export default function CeldaSelector({ celdas, selectedId, onSelect }) {
  if (!celdas || celdas.length === 0) {
    return (
      <div className="celda-selector__empty">
        No hay celdas disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="celda-selector">
      {celdas.map((celda) => {
        const isSelected = selectedId === celda.id;
        const typeClass = typeColorMap[celda.tipo] || 'celda--general';

        return (
          <button
            key={celda.id}
            className={`celda-card ${typeClass} ${isSelected ? 'celda-card--selected' : ''}`}
            onClick={() => onSelect(celda)}
            type="button"
          >
            {isSelected && (
              <CheckCircle size={18} className="celda-card__check" />
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
