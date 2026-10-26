import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Alert.css';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function Alert({ type = 'info', message, onClose, autoDismiss = true }) {
  const [visible, setVisible] = useState(true);
  const Icon = iconMap[type] || Info;

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);

  if (!visible && autoDismiss) return null;

  return (
    <div className={`alert alert--${type} ${!visible ? 'alert--hiding' : ''}`}>
      <Icon size={20} className="alert__icon" />
      <span className="alert__message">{message}</span>
      <button className="alert__close" onClick={() => { setVisible(false); onClose?.(); }} aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  );
}
