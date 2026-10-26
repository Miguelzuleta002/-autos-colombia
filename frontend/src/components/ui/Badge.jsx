import './Badge.css';

export default function Badge({ status }) {
  const isOpen = status === 'ABIERTO';
  const className = `badge ${isOpen ? 'badge--open' : 'badge--closed'}`;

  return <span className={className}>{isOpen ? 'Abierto' : 'Cerrado'}</span>;
}
