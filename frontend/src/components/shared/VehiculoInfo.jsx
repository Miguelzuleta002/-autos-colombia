import { Car, User, Palette } from 'lucide-react';
import './VehiculoInfo.css';

export default function VehiculoInfo({ vehiculo }) {
  if (!vehiculo) return null;

  return (
    <div className="vehiculo-info">
      <div className="vehiculo-info__header">
        <Car size={20} className="vehiculo-info__icon" />
        <span className="vehiculo-info__placa">{vehiculo.placa}</span>
      </div>
      <div className="vehiculo-info__grid">
        <div className="vehiculo-info__item">
          <span className="vehiculo-info__label">Tipo</span>
          <span className="vehiculo-info__value">{vehiculo.tipo || '-'}</span>
        </div>
        <div className="vehiculo-info__item">
          <span className="vehiculo-info__label">Marca</span>
          <span className="vehiculo-info__value">{vehiculo.marca || '-'}</span>
        </div>
        <div className="vehiculo-info__item">
          <span className="vehiculo-info__label">Modelo</span>
          <span className="vehiculo-info__value">{vehiculo.modelo || '-'}</span>
        </div>
        <div className="vehiculo-info__item">
          <span className="vehiculo-info__label">Color</span>
          <span className="vehiculo-info__value">
            {vehiculo.color && (
              <span
                className="vehiculo-info__color-dot"
                style={{ background: vehiculo.colorHex || '#ccc' }}
              />
            )}
            {vehiculo.color || '-'}
          </span>
        </div>
        {vehiculo.cliente && (
          <div className="vehiculo-info__item vehiculo-info__item--full">
            <span className="vehiculo-info__label">Propietario</span>
            <span className="vehiculo-info__value">
              <User size={14} style={{ marginRight: 4 }} />
              {vehiculo.cliente.nombre} {vehiculo.cliente.apellido || ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
