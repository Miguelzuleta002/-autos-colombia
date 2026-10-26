import { Inbox } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ icon: Icon, title, description }) {
  const DisplayIcon = Icon || Inbox;

  return (
    <div className="empty-state">
      <DisplayIcon size={48} className="empty-state__icon" />
      <h3 className="empty-state__title">{title || 'Sin resultados'}</h3>
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  );
}
