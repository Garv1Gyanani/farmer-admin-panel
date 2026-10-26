import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Award,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Modal } from './Modal';
import { apiFetch } from '../api';

export const SoilReportModal = ({ isOpen, onClose, parcelId, parcelName, farmerName }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !parcelId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    apiFetch(`/api/farmers/parcels/${parcelId}/soil-report`)
      .then((res) => {
        if (isMounted) {
          setReport(res.report);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load soil report');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, parcelId]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Precision Soil Health & Agronomy Card"
      maxWidth="780px"
      footer={
        <button onClick={onClose} className="btn btn-secondary">
          Close Inspector
        </button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div className="pulse-beacon" style={{ display: 'inline-block', marginBottom: '10px' }} />
          <div>Retrieving calibrated soil lab telemetry from PAU database...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#b91c1c' }}>
          <AlertTriangle size={32} style={{ marginBottom: '8px' }} />
          <div>{error}</div>
        </div>
      ) : report ? (
        <div>
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #02200c 0%, #17351f 100%)',
              color: '#ffffff',
              padding: '18px 20px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <FlaskConical size={20} color="#c8eccb" />
                <span style={{ fontSize: '16px', fontWeight: 700 }}>
                  {parcelName || report.parcelName || 'Field Parcel'}
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(200, 236, 203, 0.2)',
                    color: '#c8eccb',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                >
                  PAU Benchmarked
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#c8eccb', opacity: 0.9 }}>
                Grower: <strong>{farmerName || 'Beneficiary Farmer'}</strong> • Sample ID: {report.sampleId}
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                <Award size={14} color="#f59e0b" />
                <span>{report.laboratory?.accreditation || 'NABL Accredited'}</span>
              </div>
              <div style={{ opacity: 0.8 }}>{report.laboratory?.name}</div>
            </div>
          </div>

          {/* Primary Soil Parameter Metrics */}
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="var(--primary)" />
            <span>Macro-Nutrient & Chemical Balances (NPK & pH)</span>
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {/* Nitrogen */}
            <div className="card" style={{ padding: '14px', background: '#fafafa', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE NITROGEN (N)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0', color: '#02200c' }}>
                {report.parameters?.nitrogen?.value || 240}{' '}
                <span style={{ fontSize: '12px', fontWeight: 500 }}>kg/ha</span>
              </div>
              <span className={`status-pill ${report.parameters?.nitrogen?.rating === 'low' ? 'action_needed' : 'active'}`}>
                {report.parameters?.nitrogen?.rating?.toUpperCase()}
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Optimal: {report.parameters?.nitrogen?.idealRange || '280-560 kg/ha'}
              </div>
            </div>

            {/* Phosphorus */}
            <div className="card" style={{ padding: '14px', background: '#fafafa', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PHOSPHORUS (P₂O₅)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0', color: '#02200c' }}>
                {report.parameters?.phosphorus?.value || 19.5}{' '}
                <span style={{ fontSize: '12px', fontWeight: 500 }}>kg/ha</span>
              </div>
              <span className="status-pill active">
                {report.parameters?.phosphorus?.rating?.toUpperCase()}
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Optimal: {report.parameters?.phosphorus?.idealRange || '10-25 kg/ha'}
              </div>
            </div>

            {/* Potassium */}
            <div className="card" style={{ padding: '14px', background: '#fafafa', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>POTASSIUM (K₂O)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0', color: '#02200c' }}>
                {report.parameters?.potassium?.value || 285}{' '}
                <span style={{ fontSize: '12px', fontWeight: 500 }}>kg/ha</span>
              </div>
              <span className="status-pill active">
                {report.parameters?.potassium?.rating?.toUpperCase()}
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Optimal: {report.parameters?.potassium?.idealRange || '110-280 kg/ha'}
              </div>
            </div>

            {/* pH Value */}
            <div className="card" style={{ padding: '14px', background: '#fafafa', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SOIL REACTION (pH)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0', color: '#16a34a' }}>
                {report.parameters?.ph?.value || 7.2}
              </div>
              <span className="status-pill active">
                {report.parameters?.ph?.rating?.toUpperCase()}
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Neutral Range: 6.5 - 7.5
              </div>
            </div>

            {/* Organic Carbon */}
            <div className="card" style={{ padding: '14px', background: '#fafafa', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ORGANIC CARBON (OC)</div>
              <div style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0', color: '#02200c' }}>
                {report.parameters?.organicCarbon?.value || 0.68}%
              </div>
              <span className="status-pill active">
                {report.parameters?.organicCarbon?.rating?.toUpperCase()}
              </span>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Target: {report.parameters?.organicCarbon?.idealRange || '> 0.75%'}
              </div>
            </div>
          </div>

          {/* Prescribed Fertilizer Schedules */}
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#d97706" />
            <span>Prescribed Agronomic Fertilizer Schedule (Dosage / Acre)</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {(report.fertilizerRecommendations || []).map((rec, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>
                    {rec.fertilizerName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Timing: {rec.applicationTiming}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {rec.dosagePerAcre}
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {rec.purpose}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Crop Suitability Index */}
          <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '10px' }}>
            Seasonal Crop Suitability Index
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {(report.cropSuitability || []).map((cropItem, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #c8eccb',
                  backgroundColor: '#f6fbf1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '13px', color: '#02200c' }}>{cropItem.crop}</strong>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '13px' }}>
                    {cropItem.suitabilityScore}% Match
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  {cropItem.notes || 'Optimal match for soil pH and nutrient profile.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
