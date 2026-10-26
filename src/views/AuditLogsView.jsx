import React from 'react';
import { ScrollText, ShieldCheck, Clock, User } from 'lucide-react';

export const AuditLogsView = ({ logs = [] }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <ScrollText size={18} color="#02200C" />
          <span>Administrative Audit Trail ({logs.length})</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin Operator</th>
              <th>Action Executed</th>
              <th>Entity Type</th>
              <th>Operation Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#1b5e20" />
                    <span style={{ fontWeight: 600 }}>{log.adminEmail || 'admin@profarmer.com'}</span>
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#ebefe6',
                      color: '#02200C',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{log.targetType}</span>
                </td>
                <td>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {log.details?.reason || log.details?.action || log.details?.message || JSON.stringify(log.details || {})}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
