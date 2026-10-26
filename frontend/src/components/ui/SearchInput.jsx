import { Search } from 'lucide-react';
import './SearchInput.css';

export default function SearchInput({ value, onChange, onSearch, placeholder, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="search-input">
      <Search size={18} className="search-input__icon" />
      <input
        type="text"
        className="search-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Buscar...'}
        disabled={disabled}
      />
      {onSearch && (
        <button
          className="search-input__btn"
          onClick={onSearch}
          disabled={disabled || !value.trim()}
        >
          Buscar
        </button>
      )}
    </div>
  );
}
