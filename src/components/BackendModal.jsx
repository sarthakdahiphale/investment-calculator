import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Terminal, 
  Copy, 
  Code
} from 'lucide-react';

export function BackendModal({ isOpen, onClose, isBackendOnline, onRetryHealth }) {
  const [copiedTab, setCopiedTab] = useState(null);

  if (!isOpen) return null;

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const flaskRunScript = `cd backend
pip install -r requirements.txt
python app.py`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px', padding: '24px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              <Server size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)' }}>
                Python Flask REST API & MySQL Integration
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Full-stack architecture documentation and connection status
              </p>
            </div>
          </div>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ padding: '4px' }} 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Connection Status Box */}
        <div style={{ 
          background: isBackendOnline ? 'var(--color-success-bg)' : 'var(--bg-subtle)', 
          border: isBackendOnline ? '1px solid var(--color-success-border)' : '1px solid var(--border-card)', 
          borderRadius: 'var(--radius-md)', 
          padding: '14px', 
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: isBackendOnline ? 'var(--color-success)' : '#94a3b8' 
              }} />
              <strong style={{ fontSize: '0.9rem', color: isBackendOnline ? 'var(--color-success)' : 'var(--text-heading)' }}>
                {isBackendOnline ? 'Flask REST API Connected' : 'Running in Local Storage Mode'}
              </strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isBackendOnline 
                ? 'Persisting projects and calculations directly to MySQL through Flask.' 
                : 'All calculations and projects are saved offline in browser storage with instant response times.'}
            </p>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onRetryHealth}
          >
            Refresh Status
          </button>
        </div>

        {/* Quick Launch Commands */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} /> Start the Included Python Flask Server:
            </span>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: '0.72rem', padding: '2px 6px' }}
              onClick={() => copyCode(flaskRunScript, 'run')}
            >
              <Copy size={12} />
              <span>{copiedTab === 'run' ? 'Copied!' : 'Copy Commands'}</span>
            </button>
          </div>

          <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', overflowX: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
{`cd backend
pip install -r requirements.txt
python app.py`}
          </pre>
        </div>

        {/* REST API Endpoints Table */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code size={14} /> Available Flask REST Endpoints:
          </div>

          <div className="data-table-container">
            <table className="data-table" style={{ fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Method</th>
                  <th>Endpoint</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-teal">GET</span></td>
                  <td className="font-mono">/api/health</td>
                  <td>Health check and backend ping</td>
                </tr>
                <tr>
                  <td><span className="badge badge-teal">GET</span></td>
                  <td className="font-mono">/api/projects</td>
                  <td>List all investment projects from MySQL</td>
                </tr>
                <tr>
                  <td><span className="badge badge-emerald">POST</span></td>
                  <td className="font-mono">/api/projects</td>
                  <td>Save or update project & cash flows</td>
                </tr>
                <tr>
                  <td><span className="badge badge-rose">DELETE</span></td>
                  <td className="font-mono">/api/projects/&lt;id&gt;</td>
                  <td>Remove project record and cash flows</td>
                </tr>
                <tr>
                  <td><span className="badge badge-emerald">POST</span></td>
                  <td className="font-mono">/api/calculate</td>
                  <td>Backend validation calculation for NPV/IRR/ROI</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
