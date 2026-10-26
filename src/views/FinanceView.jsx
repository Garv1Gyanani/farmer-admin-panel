import React, { useState } from 'react';
import {
  Wallet,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Coins,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { apiFetch } from '../api';

export const FinanceView = ({
  payouts = [],
  transactions = [],
  commissions = [],
  onProcessPayout,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState('payouts'); // 'payouts', 'transactions', or 'commissions'
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'approve' or 'reject'
  const [utrReference, setUtrReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [vestingState, setVestingState] = useState({ isVesting: false, lastResult: null });

  const handleTriggerVesting = async () => {
    setVestingState({ isVesting: true, lastResult: null });
    try {
      const res = await apiFetch('/api/admin/commissions/vest-now', { method: 'POST' });
      setVestingState({ isVesting: false, lastResult: res });
    } catch (err) {
      alert(`Vesting sweep failed: ${err.message}`);
      setVestingState({ isVesting: false, lastResult: null });
    }
  };

  const pendingPayouts = payouts.filter((p) => p.status === 'pending');

  const handleApproveSubmit = async () => {
    if (!selectedPayout) return;
    await onProcessPayout(selectedPayout._id, 'approve', utrReference, adminNotes);
    setModalMode(null);
    setSelectedPayout(null);
    setUtrReference('');
    setAdminNotes('');
  };

  const handleRejectSubmit = async () => {
    if (!selectedPayout) return;
    await onProcessPayout(selectedPayout._id, 'reject', '', adminNotes);
    setModalMode(null);
    setSelectedPayout(null);
    setAdminNotes('');
  };

  return (
    <div>
      {/* Automated Commission Vesting Engine Card */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #02200c 0%, #17351f 100%)',
          color: '#ffffff',
          borderRadius: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(200, 236, 203, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c8eccb',
              }}
            >
              <Coins size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800 }}>Field Agent Commission Vesting Engine</span>
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
                  Automated Daily at 00:00
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#c8eccb', opacity: 0.9 }}>
                Scans all pending referral commissions past their 7-day maturation period, vests funds into Agent withdrawable wallets, and writes ledger entries.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerVesting}
            disabled={vestingState.isVesting}
            className="btn btn-sm"
            style={{
              background: '#c8eccb',
              color: '#02200c',
              fontWeight: 800,
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={15} />
            <span>{vestingState.isVesting ? 'Processing Vesting Sweep...' : 'Run Vesting Sweep Now'}</span>
          </button>
        </div>

        {vestingState.lastResult && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              fontSize: '12px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle size={15} color="#c8eccb" />
            <span>
              {vestingState.lastResult.message ||
                `Vesting sweep complete: ${vestingState.lastResult.result?.count || 0} commissions processed.`}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Switcher */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('payouts')}
        >
          <span>Withdrawal Payout Requests</span>
          <span className="pill-count">{pendingPayouts.length}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <span>Global Financial Ledger</span>
          <span className="pill-count">{transactions.length}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'commissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('commissions')}
        >
          <span>Field Agent Commission Records</span>
          <span className="pill-count">{commissions.length}</span>
        </button>
      </div>

      {activeTab === 'payouts' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Wallet size={18} color="#2e7d32" />
              <span>Partner Withdrawal Requests ({payouts.length})</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th>Applicant</th>
                  <th>Role</th>
                  <th>Amount</th>
                  <th>Bank Account Details</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {p.payoutNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.userId?.name || 'Partner'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.userId?.phone}</div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p.userRole}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#1b5e20', fontSize: '15px' }}>
                        ₹{p.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
                        {p.bankDetails?.bankName} ({p.bankDetails?.accountHolder})
                      </div>
                      <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        A/C: {p.bankDetails?.accountNumber} • IFSC: {p.bankDetails?.ifsc}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${p.status}`}>{p.status}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {p.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedPayout(p);
                              setModalMode('approve');
                              setUtrReference(`UTR-${Date.now().toString().slice(-8)}`);
                            }}
                            className="btn btn-success btn-sm"
                            title="Approve Bank Payout"
                          >
                            <CheckCircle size={13} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayout(p);
                              setModalMode('reject');
                            }}
                            className="btn btn-danger btn-sm"
                            title="Decline Payout"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {p.utrReference ? `UTR: ${p.utrReference}` : 'Processed'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IndianRupee size={18} color="#02200C" />
              <span>Consolidated Transaction Ledger</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User / Role</th>
                  <th>Transaction Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tx.userId?.name || 'System User'}</div>
                      <div style={{ fontSize: '11px', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                        {tx.userRole}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: tx.type.includes('credit') ? '#e8f5e9' : '#fee2e2',
                          color: tx.type.includes('credit') ? '#1b5e20' : '#ba1a1a',
                        }}
                      >
                        {tx.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px' }}>{tx.description}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: tx.type.includes('credit') ? '#16a34a' : '#ba1a1a',
                        }}
                      >
                        {tx.type.includes('credit') ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>₹{tx.balanceAfter?.toLocaleString() || 0}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${tx.status}`}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Coins size={18} color="#b45309" />
              <span>Field Agent Referral & Booking Commissions ({commissions.length})</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Field Agent</th>
                  <th>Referred Grower</th>
                  <th>Booking Job</th>
                  <th>Commission Amount</th>
                  <th>Maturation Status</th>
                  <th>Maturity Date</th>
                  <th>Vesting Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.length > 0 ? (
                  commissions.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {c.agentId?.name || 'Agent'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {c.agentId?.phone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.farmerId?.name || 'Farmer'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.farmerId?.phone}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {c.bookingId?.bookingNumber || 'Job #'}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          GMV: ₹{c.bookingId?.pricing?.totalAmount || c.bookingTotalAmount || 0}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '14.5px' }}>
                          ₹{c.amount?.toLocaleString()}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Rate: {c.commissionRate || 5}%
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${c.status === 'vested' ? 'active' : 'pending'}`}>
                          {c.status === 'vested' ? 'Vested in Wallet' : c.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {c.maturationDate ? new Date(c.maturationDate).toLocaleDateString('en-IN') : '7-Day Maturing'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {c.vestedAt ? new Date(c.vestedAt).toLocaleDateString('en-IN') : 'Awaiting Cron Sweep'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No referral commission records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout Approval Modal */}
      {selectedPayout && (
        <Modal
          isOpen={modalMode === 'approve'}
          onClose={() => setModalMode(null)}
          title={`Approve Bank Payout — ${selectedPayout.payoutNumber}`}
          maxWidth="520px"
          footer={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalMode(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleApproveSubmit}
                className="btn btn-success"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Transfer...' : 'Confirm & Disburse Funds'}
              </button>
            </div>
          }
        >
          <div>
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
              }}
            >
              <div>Payee: <strong>{selectedPayout.userId?.name} ({selectedPayout.userRole})</strong></div>
              <div>Disbursement Amount: <strong style={{ color: '#1b5e20', fontSize: '16px' }}>₹{selectedPayout.amount.toLocaleString()}</strong></div>
              <div>Bank: <strong>{selectedPayout.bankDetails?.bankName} (A/C: {selectedPayout.bankDetails?.accountNumber})</strong></div>
              <div>IFSC: <strong>{selectedPayout.bankDetails?.ifsc}</strong></div>
            </div>

            <div className="form-group">
              <label className="form-label">Bank UTR / IMPS Transfer Reference</label>
              <input
                type="text"
                required
                className="form-control"
                value={utrReference}
                onChange={(e) => setUtrReference(e.target.value)}
                placeholder="e.g. UTR-2026-98129381"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Administrative Notes</label>
              <input
                type="text"
                className="form-control"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Processed via direct commercial payment gateway"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Payout Rejection Modal */}
      {selectedPayout && (
        <Modal
          isOpen={modalMode === 'reject'}
          onClose={() => setModalMode(null)}
          title={`Decline Payout Request — ${selectedPayout.payoutNumber}`}
          maxWidth="500px"
          footer={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModalMode(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn btn-danger"
                disabled={!adminNotes || isProcessing}
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          }
        >
          <div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Declining this payout will immediately refund ₹{selectedPayout.amount.toLocaleString()} back to the applicant's wallet.
            </p>
            <div className="form-group">
              <label className="form-label">Reason for Decline (Sent to User)</label>
              <textarea
                rows={3}
                required
                className="form-control"
                placeholder="e.g. Bank IFSC code does not match branch records. Please update bank profile."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
