import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Calculator, 
  GitCompare, 
  SlidersHorizontal, 
  FolderHeart, 
  FileText, 
  Settings as SettingsIcon,
  Home
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function Sidebar({ 
  currentSection, 
  onSelectSection, 
  projectsCount, 
  activeProject,
  currency,
  onGoToLanding
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-analysis', label: 'New Analysis', icon: FileSpreadsheet },
    { id: 'metrics', label: 'Financial Metrics', icon: Calculator },
    { id: 'comparison', label: 'Project Comparison', icon: GitCompare },
    { id: 'scenarios', label: 'Scenario Analysis', icon: SlidersHorizontal },
    { id: 'saved', label: 'Saved Projects', icon: FolderHeart, count: projectsCount },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-section-title">Navigation</div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectSection(item.id)}
                id={`sidebar-nav-${item.id}`}
              >
                <IconComponent size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span 
                    style={{
                      background: isActive ? 'var(--brand-teal)' : '#e2e8f0',
                      color: isActive ? 'white' : 'var(--text-muted)',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        {activeProject && (
          <div className="active-project-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
              <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.75rem' }}>Active Appraisal</span>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeProject.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <span>Inv: {formatCurrency(activeProject.initialInvestment, currency)}</span>
              <span>{activeProject.duration} Yrs</span>
            </div>
          </div>
        )}

        <button 
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-muted)' }}
          onClick={onGoToLanding}
        >
          <Home size={15} />
          <span>Exit to Landing Page</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', fontSize: '0.7rem', color: 'var(--text-light)' }}>
          <span>InvestWise v1.0</span>
          <span>SaaS Suite</span>
        </div>
      </div>
    </aside>
  );
}
