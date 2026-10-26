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
              <option value="assigned">Assigned</option>
              <option value="en_route">En Route</option>
              <option value="in_progress">In Progress (Active Work)</option>
              <option value="completed">Completed</option>
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
          maxWidth="700px"
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
          <div>
            {/* Summary Cards */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Farmer:</span>{' '}
                <strong>{selectedBooking.farmerId?.name} ({selectedBooking.farmerId?.phone})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Service:</span>{' '}
                <strong>{selectedBooking.serviceId?.title}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Parcel Name:</span>{' '}
                <strong>{selectedBooking.parcelDetails?.name} ({selectedBooking.parcelDetails?.acreage} Acres)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Approach Road Notes:</span>{' '}
                <strong>{selectedBooking.parcelDetails?.approachRoadNotes || 'Standard tractor access road'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>{' '}
                <strong style={{ color: '#1b5e20' }}>₹{selectedBooking.pricing?.totalAmount?.toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Operator Share (85%):</span>{' '}
                <strong>₹{selectedBooking.pricing?.providerPayoutAmount?.toLocaleString()}</strong>
              </div>
            </div>

            {/* Work Certificate if completed */}
            {selectedBooking.completionSignoff?.completedAt && (
              <div
                style={{
                  border: '1px solid #c8eccb',
                  backgroundColor: '#f6fbf1',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '20px',
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
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
              Operational Stepper Timeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(selectedBooking.timeline || []).map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#2e7d32',
                      marginTop: '6px',
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
        </Modal>
      )}
    </div>
  );
};
