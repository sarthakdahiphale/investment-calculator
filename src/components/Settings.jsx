import React, { useState } from 'react';
import { 
  Globe, 
  RotateCcw, 
  Server, 
  Database, 
  User, 
  Save, 
  Download
} from 'lucide-react';
import { CURRENCIES } from '../utils/formatters';
import { apiService } from '../services/apiService';

export function Settings({ 
  settings, 
  onSaveSettings, 
  onResetSampleData, 
  onOpenBackendModal, 
  projects 
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backendTestStatus, setBackendTestStatus] = useState(null); // null | 'testing' | 'online' | 'offline'

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestBackend = async () => {
    setBackendTestStatus('testing');
    const res = await apiService.checkBackendHealth();
    if (res.isOnline) {
      setBackendTestStatus('online');
    } else {
      setBackendTestStatus('offline');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `InvestWise_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <div>
          <h1 className="section-title">Settings & System Preferences</h1>
          <p className="section-subtitle">
            Configure currency presentation, number formatting styles, and backend API integration.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-sm"
          onClick={handleSave}
        >
          <Save size={15} />
          <span>{saveSuccess ? 'Preferences Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {/* Card 1: Regional & Number Formatting */}
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--brand-teal)' }} />
            <span>Currency & Number Formatting</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Display Currency</label>
            <select
              className="form-control"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              {Object.entries(CURRENCIES).map(([code, item]) => (
                <option key={code} value={code}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className="form-helper">Applies to all charts, tables, and metric badges across the suite.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Number Grouping System</label>
            <select
              className="form-control"
              value={formData.numberFormat}
              onChange={(e) => setFormData({ ...formData, numberFormat: e.target.value })}
            >
              <option value="indian">Indian System (₹ Lakhs & Crores: 2,45,000 / 1.5 Cr)</option>
              <option value="international">Western Standard (Millions & Thousands: 245,000 / 15M)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Default Hurdle Rate (%)</label>
            <input
              type="number"
              step="0.5"
              className="form-control font-mono"
              value={formData.defaultDiscountRate}
              onChange={(e) => setFormData({ ...formData, defaultDiscountRate: Number(e.target.value) })}
            />
            <span className="form-helper">Pre-filled default for newly created analyses.</span>
          </div>
        </div>

        {/* Card 2: Python Flask & MySQL Integration */}
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} style={{ color: '#0284c7' }} />
            <span>Python Flask REST API Connection</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Backend REST Endpoint URL</label>
            <input
              type="text"
              className="form-control font-mono"
              placeholder="http://127.0.0.1:5000/api"
              value={formData.backendApiUrl}
              onChange={(e) => setFormData({ ...formData, backendApiUrl: e.target.value })}
            />
            <span className="form-helper">Connects to Python Flask REST API with MySQL persistence.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', alignItems: 'center' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestBackend}
            >
              <span>Test Connection</span>
            </button>
            <button 
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onOpenBackendModal}
            >
              <Database size={14} />
              <span>View Schema & Docs</span>
            </button>
          </div>

          {backendTestStatus && (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: backendTestStatus === 'online' ? 'var(--color-success-bg)' : '#fef2f2', color: backendTestStatus === 'online' ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {backendTestStatus === 'testing' && 'Pinging Flask backend at ' + formData.backendApiUrl + '...'}
              {backendTestStatus === 'online' && 'Flask REST API is online and responding!'}
              {backendTestStatus === 'offline' && 'Backend offline. Frontend is operating in standalone Local Storage mode.'}
            </div>
          )}
        </div>

        {/* Card 3: User Profile & Security */}
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--color-purple)' }} />
            <span>Appraisal Analyst Profile</span>
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
              IW
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Financial Analyst (Demo)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate Finance & Capital Budgeting</div>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', marginTop: '3px' }}>Enterprise License</span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            No fake cloud authentication is displayed. Authentication can be linked to your corporate LDAP/SSO or Flask JWT token service.
          </div>
        </div>

        {/* Card 4: Data Management & Backup */}
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: '#d97706' }} />
            <span>Data Management & Maintenance</span>
          </h3>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Back up your financial models to JSON, restore original demo scenarios, or clear workspace cache.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handleExportJSON}
              style={{ justifyContent: 'flex-start' }}
            >
              <Download size={15} />
              <span>Download Portfolio JSON Backup</span>
            </button>

            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (window.confirm('Reset all saved projects back to original realistic sample demonstrations?')) {
                  onResetSampleData();
                }
              }}
              style={{ justifyContent: 'flex-start' }}
            >
              <RotateCcw size={15} />
              <span>Restore Sample Demonstration Models</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
