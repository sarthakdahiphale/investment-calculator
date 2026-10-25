import React, { useState } from 'react';
import { 
  FolderHeart, 
  Search, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  RotateCcw,
  AlertTriangle,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { analyzeProject } from '../utils/financialCalculations';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';

export function SavedProjects({ 
  projects, 
  currency, 
  onSelectProject, 
  onEditProject, 
  onDuplicateProject, 
  onDeleteProject, 
  onResetSampleData, 
  onNavigate 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState('updatedAt'); // 'name' | 'initialInvestment' | 'npv' | 'irr' | 'roi' | 'updatedAt'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Pre-calculate metrics for each project
  const enrichedProjects = projects.map((p) => {
    const analysis = analyzeProject(p);
    return {
      ...p,
      analysis,
      calculatedNPV: analysis.npv.npv,
      calculatedIRR: analysis.irr.irr || -999,
      calculatedROI: analysis.roi.roiPercentage,
    };
  });

  // Filter & Search
  const filtered = enrichedProjects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'npv') {
      aVal = a.calculatedNPV;
      bVal = b.calculatedNPV;
    } else if (sortField === 'irr') {
      aVal = a.calculatedIRR;
      bVal = b.calculatedIRR;
    } else if (sortField === 'roi') {
      aVal = a.calculatedROI;
      bVal = b.calculatedROI;
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Project Name', 'Category', 'Initial Investment', 'Duration (Yrs)', 'Discount Rate (%)', 'NPV', 'IRR (%)', 'Payback (Yrs)', 'ROI (%)', 'Feasibility Status', 'Last Updated'];
    const rows = sorted.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category || 'General'}"`,
      p.initialInvestment,
      p.duration,
      p.discountRate,
      Math.round(p.calculatedNPV),
      p.analysis.irr.irr !== null ? p.analysis.irr.irr : 'N/A',
      p.analysis.payback.paybackYears !== null ? p.analysis.payback.paybackYears : 'Unrecovered',
      p.calculatedROI,
      `"${p.analysis.feasibility.verdict}"`,
      `"${p.updatedAt || p.createdAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InvestWise_Portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <div>
          <h1 className="section-title">Saved Investment Projects</h1>
          <p className="section-subtitle">
            Manage your library of financial feasibility analyses, duplicate models, and export portfolio records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            title="Download CSV table of all projects"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('new-analysis')}
          >
            <PlusCircle size={15} />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, sector or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              style={{ padding: '8px 12px', width: 'auto' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Sectors ({projects.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{sorted.length}</strong> of <strong>{projects.length}</strong> project models
        </div>
      </div>

      {/* Projects Table */}
      {sorted.length > 0 ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Project Name</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Category</th>
                  <th onClick={() => handleSort('initialInvestment')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Initial Outlay</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('npv')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>NPV</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('irr')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>IRR</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('roi')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>ROI</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Status</th>
                  <th onClick={() => handleSort('updatedAt')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Last Updated</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                          {p.name}
                        </div>
                        {p.isSample && (
                          <span className="badge badge-neutral" style={{ fontSize: '0.62rem', padding: '1px 5px', marginTop: '2px' }}>
                            Demonstration Model
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{p.category || 'General'}</span>
                    </td>
                    <td className="font-mono">{formatCurrency(p.initialInvestment, currency)}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: p.calculatedNPV >= 0 ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                      {formatCurrency(p.calculatedNPV, currency)}
                    </td>
                    <td className="font-mono" style={{ fontWeight: 600 }}>
                      {p.analysis.irr.irr !== null ? `${p.analysis.irr.irr}%` : '—'}
                    </td>
                    <td className="font-mono" style={{ color: p.calculatedROI > 0 ? 'var(--color-success)' : 'inherit' }}>
                      {formatPercent(p.calculatedROI)}
                    </td>
                    <td>
                      <span className={`badge badge-${p.analysis.feasibility.badgeColor}`}>
                        {p.analysis.feasibility.verdict}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(p.updatedAt || p.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px' }}
                          title="View Metrics & Appraisal"
                          onClick={() => {
                            onSelectProject(p.id);
                            onNavigate('metrics');
                          }}
                        >
                          <Eye size={15} style={{ color: 'var(--brand-teal)' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px' }}
                          title="Edit Assumptions"
                          onClick={() => onEditProject(p)}
                        >
                          <Edit3 size={15} style={{ color: 'var(--text-heading)' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px' }}
                          title="Duplicate Model"
                          onClick={() => onDuplicateProject(p.id)}
                        >
                          <Copy size={15} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px', color: 'var(--color-danger)' }}
                          title="Delete Analysis"
                          onClick={() => setDeleteConfirmId(p.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <FolderHeart size={44} style={{ color: 'var(--text-light)', margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Saved Analyses Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.85rem' }}>
            {searchTerm || categoryFilter !== 'all'
              ? 'No projects match your current search and filter criteria.'
              : 'You currently have no project analyses saved in local storage.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('new-analysis')}>
              <PlusCircle size={15} />
              <span>Create New Analysis</span>
            </button>
            <button className="btn btn-secondary" onClick={onResetSampleData}>
              <RotateCcw size={15} />
              <span>Restore Sample Projects</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', color: 'var(--color-danger)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.15rem' }}>Confirm Delete</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to delete this appraisal analysis? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  onDeleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                Delete Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
