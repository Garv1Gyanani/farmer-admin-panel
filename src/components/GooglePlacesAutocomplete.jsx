import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { apiFetch } from '../api';

export const GooglePlacesAutocomplete = ({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search address or location...',
  className = 'form-control',
  style = {},
  required = false,
}) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val || val.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`/api/maps/autocomplete?input=${encodeURIComponent(val.trim())}`);
        if (res.success && Array.isArray(res.predictions)) {
          setPredictions(res.predictions);
          setIsOpen(res.predictions.length > 0);
        } else {
          setPredictions([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.warn('Google Places autocomplete fetch error:', err);
        setPredictions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 280);
  };

  const handleSelectPrediction = (item) => {
    const mainText = item.mainText || item.description;
    setQuery(mainText);
    setIsOpen(false);
    if (onSelect) {
      onSelect(item);
    } else if (onChange) {
      onChange(mainText);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          required={required}
          className={className}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          style={{ width: '100%', paddingRight: isLoading ? '36px' : '12px' }}
        />
        {isLoading && (
          <Loader2
            size={16}
            className="spin"
            style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)' }}
          />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: 'var(--radius-md, 10px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        >
          {predictions.map((p, idx) => (
            <div
              key={p.placeId || idx}
              onClick={() => handleSelectPrediction(p)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                borderBottom: idx === predictions.length - 1 ? 'none' : '1px solid #f1f5f9',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container, #f8fafc)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <MapPin size={16} style={{ color: 'var(--primary, #065f46)', flexShrink: 0, marginTop: '3px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                  {p.mainText || p.description}
                </div>
                {p.secondaryText && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.secondaryText}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

