import { Loader } from 'lucide-react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message }) {
  return (
    <div className="loading-spinner">
      <Loader size={32} className="loading-spinner__icon" />
      <span className="loading-spinner__message">{message || 'Cargando...'}</span>
    </div>
  );
}
