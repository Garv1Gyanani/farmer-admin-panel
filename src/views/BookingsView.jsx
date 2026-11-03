import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Key,
  MapPin,
  Clock,
  Eye,
  FileCheck,
  CheckCircle,
  Tractor,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  User,
  Phone,
  Mail,
  Navigation,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { getAuthToken } from '../api';

export const BookingsView = ({ bookings = [] }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const downloadPdf = async (bookingId, type, bookingNumber) => {
    try {
      setDownloadingId(`${bookingId}-${type}`);
      const token = getAuthToken();
      const endpoint =
        type === 'invoice'
          ? `/api/bookings/${bookingId}/invoice`
          : `/api/bookings/${bookingId}/certificate`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download document from server');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        type === 'invoice'
          ? `Tax-Invoice-${bookingNumber}.pdf`
          : `Work-Certificate-${bookingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.farmerId?.name && b.farmerId.name.toLowerCase().includes(search.toLowerCase())) ||
      (b.parcelDetails?.village && b.parcelDetails.village.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Top Filter */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ width: '340px' }}>
            <Search size={16} color="#727971" />
            <input
              type="text"
              placeholder="Search by Booking Number (PF-2026-...), Farmer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Operations ({bookings.length})</option>
              <option value="pending_broadcast">Pending Dispatch Broadcast</option>
              <option value="assigned">Assigned / Accepted</option>
              <option value="in_progress">In Progress (Active Work)</option>
              <option value="completion_pending">Completion Pending (Awaiting OTP)</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <CalendarCheck size={18} color="#2e7d32" />
            <span>Field Operations Dispatch Cockpit</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Farmer & Farm Parcel</th>
                <th>Service & Machinery</th>
                <th>Assigned Provider</th>
                <th>Start OTP</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                      {b.bookingNumber}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(b.scheduledDate || Date.now()).toLocaleDateString()} ({b.timeSlot})
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.farmerId?.name || 'Farmer'}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} />
                      {b.parcelDetails?.village || 'Field'} • {b.parcelDetails?.acreage || 5} Acres
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.serviceId?.title || 'Mechanization'}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {b.serviceId?.machineryType || 'Heavy Agri Machine'}
                    </div>
                  </td>
                  <td>
                    {b.providerId ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#1b5e20' }}>{b.providerId.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.providerId.phone}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#b7791f', fontWeight: 600 }}>
                        Broadcasting to Area Fleets...
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5eb',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        letterSpacing: '1px',
                        color: '#02200C',
                      }}
                    >
                      {b.startOtp}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${b.status}`}>{b.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800 }}>₹{b.pricing?.totalAmount?.toLocaleString()}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      {b.payment?.method?.toUpperCase()} • {b.payment?.status}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="btn btn-secondary btn-sm"
                        title="View Details"
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => downloadPdf(b._id, 'invoice', b.bookingNumber)}
                        className="btn btn-secondary btn-sm"
                        title="Download GST Tax Invoice (PDF)"
                        disabled={downloadingId === `${b._id}-invoice`}
                      >
                        <Download size={13} color="var(--primary)" />
                        <span>{downloadingId === `${b._id}-invoice` ? '...' : 'Invoice'}</span>
                      </button>

                      {b.status === 'completed' && (
                        <button
                          onClick={() => downloadPdf(b._id, 'certificate', b.bookingNumber)}
                          className="btn btn-secondary btn-sm"
                          title="Download Work Completion Certificate (PDF)"
                          disabled={downloadingId === `${b._id}-certificate`}
                          style={{ borderColor: '#c8eccb', background: '#f6fbf1' }}
                        >
                          <FileCheck size={13} color="#16a34a" />
                          <span>{downloadingId === `${b._id}-certificate` ? '...' : 'Cert'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details & Timeline Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Dossier — ${selectedBooking.bookingNumber}`}
          maxWidth="760px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => downloadPdf(selectedBooking._id, 'invoice', selectedBooking.bookingNumber)}
                  className="btn btn-secondary btn-sm"
                  disabled={downloadingId === `${selectedBooking._id}-invoice`}
                >
                  <Download size={14} color="var(--primary)" />
                  <span>Download Tax Invoice (PDF)</span>
                </button>

                {selectedBooking.status === 'completed' && (
                  <button
                    onClick={() => downloadPdf(selectedBooking._id, 'certificate', selectedBooking.bookingNumber)}
                    className="btn btn-secondary btn-sm"
                    disabled={downloadingId === `${selectedBooking._id}-certificate`}
                    style={{ borderColor: '#c8eccb', background: '#f6fbf1' }}
                  >
                    <FileCheck size={14} color="#16a34a" />
                    <span>Download Work Certificate (PDF)</span>
                  </button>
                )}
              </div>

              <button onClick={() => setSelectedBooking(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Live Operational Status Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`status-pill ${selectedBooking.status}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Placed on {new Date(selectedBooking.createdAt || selectedBooking.timeline?.[0]?.timestamp || Date.now()).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>START WORK OTP:</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    fontWeight: 800,
                    backgroundColor: '#e8f5e9',
                    color: '#1b5e20',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    letterSpacing: '1.5px',
                    border: '1px solid #c8eccb',
                  }}
                >
                  #{selectedBooking.startOtp || '3841'}
                </span>
              </div>
            </div>

            {/* Grid Section 1: Farmer & Farm Parcel Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '14px',
              }}
            >
              {/* Farmer Info */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '14px',
                  backgroundColor: 'var(--surface-card, #fff)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <User size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Farmer Client Details</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Name:</span>{' '}
                    <strong>{selectedBooking.farmerId?.name || 'Verified Farmer'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Phone:</span>{' '}
                    <strong>{selectedBooking.farmerId?.phone || 'N/A'}</strong>
                  </div>
                  {selectedBooking.farmerId?.email && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Email:</span>{' '}
                      <strong>{selectedBooking.farmerId?.email}</strong>
                    </div>
                  )}
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Location Area:</span>{' '}
                    <strong>
                      {[
                        selectedBooking.parcelDetails?.village,
                        selectedBooking.parcelDetails?.tehsil,
                        selectedBooking.parcelDetails?.district,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'Jaipur Rural Area'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Parcel & Field GPS */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '14px',
                  backgroundColor: 'var(--surface-card, #fff)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Parcel & Field Telemetry</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Parcel Name:</span>{' '}
                    <strong>{selectedBooking.parcelDetails?.name || 'Primary Farm Parcel'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Target Acreage:</span>{' '}
                    <strong style={{ color: 'var(--primary)' }}>
                      {selectedBooking.parcelDetails?.acreage || selectedBooking.pricing?.units || 3} Acres
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Crop / Work Type:</span>{' '}
                    <strong>{selectedBooking.parcelDetails?.cropType || 'Agricultural Field Work'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Approach Road:</span>{' '}
                    <strong>{selectedBooking.parcelDetails?.approachRoadNotes || 'Standard tractor all-weather access road'}</strong>
                  </div>
                  {selectedBooking.parcelDetails?.location?.coordinates && (
                    <div style={{ marginTop: '2px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>GPS:</span>{' '}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {selectedBooking.parcelDetails.location.coordinates[1]?.toFixed(4)}°N,{' '}
                        {selectedBooking.parcelDetails.location.coordinates[0]?.toFixed(4)}°E
                      </span>{' '}
                      <a
                        href={`https://www.google.com/maps?q=${selectedBooking.parcelDetails.location.coordinates[1]},${selectedBooking.parcelDetails.location.coordinates[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#1b5e20', fontWeight: 600, fontSize: '11.5px', textDecoration: 'underline', marginLeft: '4px' }}
                      >
                        Open Map ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid Section 2: Service & Dispatch Operator */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '14px',
              }}
            >
              {/* Service & Schedule */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '14px',
                  backgroundColor: 'var(--surface-card, #fff)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Tractor size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Service & Schedule</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Service:</span>{' '}
                    <strong>{selectedBooking.serviceId?.title || 'Heavy Agricultural Machine'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Machine Model:</span>{' '}
                    <strong>{selectedBooking.serviceId?.machineryType || 'Tractor 4WD / Implement'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Scheduled Date:</span>{' '}
                    <strong>
                      {new Date(selectedBooking.scheduledDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Scheduled Slot:</span>{' '}
                    <strong>{selectedBooking.timeSlot || 'Morning (8:00 AM - 12:00 PM)'}</strong>
                  </div>
                </div>
              </div>

              {/* Assigned Fleet Partner & Field Agent */}
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '14px',
                  backgroundColor: 'var(--surface-card, #fff)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Assigned Fleet & Field Network</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Operator:</span>{' '}
                    {selectedBooking.providerId ? (
                      <strong style={{ color: '#1b5e20' }}>
                        {selectedBooking.providerId.name} ({selectedBooking.providerId.phone})
                      </strong>
                    ) : (
                      <span style={{ color: '#b7791f', fontWeight: 600 }}>
                        📡 Broadcasting to Area Fleets (Awaiting Claim)
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Field Agent:</span>{' '}
                    <strong>
                      {selectedBooking.agentId?.name
                        ? `${selectedBooking.agentId.name} (${selectedBooking.agentId.phone})`
                        : 'Direct Self-Dispatch (No Agent)'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Escrow Release Trigger:</span>{' '}
                    <strong>Start OTP Verification + Digital Signoff</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Settlement Dossier */}
            <div
              style={{
                border: '1px solid #c8eccb',
                backgroundColor: '#f6fbf1',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} color="#16a34a" />
                  <strong style={{ fontSize: '13px', color: '#02200c' }}>Financial Breakdown & Agronomy Escrow</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                    {selectedBooking.payment?.method?.toUpperCase() || 'RAZORPAY'}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontWeight: 700,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    {selectedBooking.payment?.status?.replace('_', ' ').toUpperCase() || 'ESCROW LOCKED'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  fontSize: '12.5px',
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e2f0d9',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>TOTAL CHARGED</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1b5e20' }}>
                    ₹{selectedBooking.pricing?.totalAmount?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>UNIT RATE</div>
                  <div style={{ fontWeight: 700 }}>
                    ₹{selectedBooking.pricing?.unitPrice || 120}/acre
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>BASE CHARGE</div>
                  <div style={{ fontWeight: 700 }}>
                    ₹{selectedBooking.pricing?.baseAmount?.toLocaleString() || selectedBooking.pricing?.totalAmount?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>OPERATOR PAYOUT (85%)</div>
                  <div style={{ fontWeight: 700, color: '#15803d' }}>
                    ₹{selectedBooking.pricing?.providerPayoutAmount?.toLocaleString() || Math.round(selectedBooking.pricing?.totalAmount * 0.85).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>AGENT COMMISSION</div>
                  <div style={{ fontWeight: 700, color: '#b7791f' }}>
                    ₹{selectedBooking.pricing?.agentCommissionAmount?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {selectedBooking.payment?.transactionId && (
                <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#166534', fontFamily: 'var(--font-mono)' }}>
                  Transaction / Escrow Ref: <strong>{selectedBooking.payment.transactionId}</strong>
                </div>
              )}
            </div>

            {/* Work Certificate if completed */}
            {selectedBooking.completionSignoff?.completedAt && (
              <div
                style={{
                  border: '1px solid #c8eccb',
                  backgroundColor: '#f6fbf1',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FileCheck size={18} color="#16a34a" />
                  <strong style={{ color: '#02200c' }}>Digital Work Completion Certificate</strong>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Acreage Covered: <strong>{selectedBooking.completionSignoff.acreageWorked} Acres</strong> • Operator Notes: "
                  {selectedBooking.completionSignoff.operatorNotes || 'Completed with full tractor efficiency'}"
                </div>
                {selectedBooking.completionSignoff.farmerRating && (
                  <div style={{ fontSize: '12.5px', marginTop: '6px', color: '#b7791f', fontWeight: 600 }}>
                    Farmer Rating: {selectedBooking.completionSignoff.farmerRating} ★ — "
                    {selectedBooking.completionSignoff.farmerReview}"
                  </div>
                )}
              </div>
            )}

            {/* Operational Stepper Timeline */}
            <div>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                Operational Stepper Timeline ({selectedBooking.timeline?.length || 1} Events)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '4px' }}>
                {(selectedBooking.timeline || []).map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#2e7d32',
                        marginTop: '5px',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' }}>
                        {t.status.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.note}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(t.timestamp).toLocaleTimeString()} • {new Date(t.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
