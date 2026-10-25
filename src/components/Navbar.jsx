import React, { useState } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  FolderKanban, 
  Globe, 
  Server, 
  ChevronDown
} from 'lucide-react';
import { CURRENCIES, formatCurrency } from '../utils/formatters';

export function Navbar({ 
  currentSection, 
  activeProject, 
  projects, 
  onSelectProject, 
  onNavigate, 
  currency, 
  onChangeCurrency,
  onOpenBackendModal,
  isBackendOnline,
  onGoToLanding
}) {
  const [showProjDropdown, setShowProjDropdown] = useState(false);

  const sectionTitles = {
    dashboard: 'Dashboard Overview',
    'new-analysis': 'New Investment Analysis',
    metrics: 'Financial Metrics Deep-Dive',
    comparison: 'Project Comparison',
    scenarios: 'Scenario & Sensitivity Analysis',
    saved: 'Saved Investment Projects',
    reports: 'Appraisal Report Generator',
    settings: 'Settings & Preferences',
  };

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <div className="topbar-logo" onClick={onGoToLanding} title="InvestWise Home">
          <div className="brand-icon-box">
            <TrendingUp size={20} />
          </div>
          <span className="brand-title">Invest<span>Wise</span></span>
        </div>

        <div className="section-breadcrumb">
          <span>Appraisal Suite</span>
          <span>/</span>
          <span className="current">{sectionTitles[currentSection] || 'Dashboard'}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Active Project Switcher */}
        {projects && projects.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button 
              className="project-selector"
              onClick={() => setShowProjDropdown(!showProjDropdown)}
              title="Active project being appraised"
            >
              <FolderKanban size={15} style={{ color: 'var(--brand-teal)' }} />
              <span style={{ fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeProject ? activeProject.name : 'Select Project'}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {showProjDropdown && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '260px',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-modal)',
                  border: '1px solid var(--border-light)',
                  padding: '6px',
                  zIndex: 100,
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                  Switch Active Project
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        setShowProjDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: activeProject?.id === p.id ? 'var(--brand-teal-light)' : 'transparent',
                        color: activeProject?.id === p.id ? 'var(--brand-teal)' : 'var(--text-body)',
                        fontSize: '0.825rem',
                        fontWeight: activeProject?.id === p.id ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Inv: {formatCurrency(p.initialInvestment, currency)}
                      </span>
                    </button>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={() => {
                      onNavigate('new-analysis');
                      setShowProjDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.775rem',
                      color: 'var(--brand-teal)',
                      background: 'transparent',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <PlusCircle size={14} /> + New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Currency Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <select
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-subtle)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-heading)',
              cursor: 'pointer',
              outline: 'none',
            }}
            title="Display Currency"
          >
            {Object.entries(CURRENCIES).map(([code, item]) => (
              <option key={code} value={code}>
                {item.symbol} {code}
              </option>
            ))}
          </select>
        </div>

        {/* Backend Status Pill */}
        <button
          onClick={onOpenBackendModal}
          className="badge"
          style={{
            cursor: 'pointer',
            border: isBackendOnline ? '1px solid var(--color-success-border)' : '1px solid var(--border-light)',
            background: isBackendOnline ? 'var(--color-success-bg)' : 'white',
            color: isBackendOnline ? 'var(--color-success)' : 'var(--text-muted)',
            padding: '5px 10px',
          }}
          title="Click to view Flask REST API & MySQL integration details"
        >
          <Server size={13} style={{ color: isBackendOnline ? 'var(--color-success)' : 'var(--text-muted)' }} />
          <span>{isBackendOnline ? 'Flask API Online' : 'Local Mode'}</span>
        </button>

        {/* Quick New Analysis Button */}
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onNavigate('new-analysis')}
        >
          <PlusCircle size={15} />
          <span>New Analysis</span>
        </button>

        {/* Back to Landing Page link */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onGoToLanding}
          title="Return to Landing Page"
        >
          <Globe size={14} />
          <span style={{ display: 'none', sm: 'inline' }}>Landing Page</span>
        </button>
      </div>
    </header>
  );
}
