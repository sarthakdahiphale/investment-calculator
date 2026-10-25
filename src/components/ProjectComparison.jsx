import React, { useState } from 'react';
import { 
  Check, 
  Award,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { analyzeProject } from '../utils/financialCalculations';
import { formatCurrency, formatPercent, formatYears, formatCompactCurrency } from '../utils/formatters';

export function ProjectComparison({ projects, currency, onSelectProject, onNavigate }) {
  // By default, select first 2 or 3 projects
  const [selectedIds, setSelectedIds] = useState(
    projects.slice(0, 3).map((p) => p.id)
  );

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) {
        alert('Please keep at least one project selected for comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedProjects = projects
    .filter((p) => selectedIds.includes(p.id))
    .map((p) => ({
      ...p,
      analysis: analyzeProject(p),
    }));

  // Identify best in class for each metric
  const bestNPV = Math.max(...comparedProjects.map((p) => p.analysis.npv.npv));
  const validIRRs = comparedProjects.filter((p) => p.analysis.irr.irr !== null);
  const bestIRR = validIRRs.length > 0 ? Math.max(...validIRRs.map((p) => p.analysis.irr.irr)) : null;
  const validPaybacks = comparedProjects.filter((p) => p.analysis.payback.paybackYears !== null);
  const bestPayback = validPaybacks.length > 0 ? Math.min(...validPaybacks.map((p) => p.analysis.payback.paybackYears)) : null;
  const bestROI = Math.max(...comparedProjects.map((p) => p.analysis.roi.roiPercentage));

  // Comparative bar chart data
  const comparisonChartData = comparedProjects.map((p) => ({
    name: p.name.length > 15 ? `${p.name.substring(0, 15)}...` : p.name,
    fullName: p.name,
    NPV: Math.round(p.analysis.npv.npv),
    IRR: p.analysis.irr.irr || 0,
    ROI: Math.round(p.analysis.roi.roiPercentage),
    Payback: p.analysis.payback.paybackYears || 0,
    InitialInvestment: p.initialInvestment,
  }));

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <div>
          <h1 className="section-title">Multi-Project Appraisal Comparison</h1>
          <p className="section-subtitle">
            Benchmark competing capital proposals side-by-side across returns, liquidity, and risk thresholds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedIds(projects.map((p) => p.id))}
          >
            Select All ({projects.length})
          </button>
        </div>
      </div>

      {/* Project Selector Pills */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
          SELECT PROJECTS TO BENCHMARK:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {projects.map((p) => {
            const isSel = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-pill)', padding: '5px 12px' }}
              >
                {isSel && <Check size={13} />}
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="card" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
          Comparative Financial Performance Matrix
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '160px' }}>Metric / Parameter</th>
                {comparedProjects.map((p) => (
                  <th key={p.id} style={{ minWidth: '180px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{p.name}</div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{p.category}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Initial Investment */}
              <tr>
                <td style={{ fontWeight: 700 }}>Initial Investment (C₀)</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }} className="font-mono">
                    {formatCurrency(p.initialInvestment, currency)}
                  </td>
                ))}
              </tr>

              {/* Duration */}
              <tr>
                <td style={{ fontWeight: 700 }}>Project Horizon</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.duration} Years
                  </td>
                ))}
              </tr>

              {/* Discount Rate */}
              <tr>
                <td style={{ fontWeight: 700 }}>Discount Rate / Hurdle</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.discountRate}%
                  </td>
                ))}
              </tr>

              {/* Net Present Value */}
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: 800, color: 'var(--brand-teal)' }}>
                  Net Present Value (NPV)
                </td>
                {comparedProjects.map((p) => {
                  const isTop = p.analysis.npv.npv === bestNPV && comparedProjects.length > 1;
                  return (
                    <td key={p.id} style={{ textAlign: 'center', fontWeight: 800 }} className="font-mono">
                      <div style={{ color: p.analysis.npv.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                        {formatCurrency(p.analysis.npv.npv, currency)}
                      </div>
                      {isTop && (
                        <span className="badge badge-teal" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                          <Award size={10} /> Highest NPV
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Internal Rate of Return */}
              <tr>
                <td style={{ fontWeight: 800, color: '#0284c7' }}>
                  Internal Rate of Return (IRR)
                </td>
                {comparedProjects.map((p) => {
                  const isTop = p.analysis.irr.irr === bestIRR && comparedProjects.length > 1;
                  return (
                    <td key={p.id} style={{ textAlign: 'center', fontWeight: 800 }} className="font-mono">
                      <div>{p.analysis.irr.irr !== null ? `${p.analysis.irr.irr}%` : '—'}</div>
                      {isTop && (
                        <span className="badge badge-blue" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                          <Award size={10} /> Highest IRR
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Payback Period */}
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: 800, color: '#d97706' }}>
                  Payback Period
                </td>
                {comparedProjects.map((p) => {
                  const isTop = p.analysis.payback.paybackYears === bestPayback && comparedProjects.length > 1;
                  return (
                    <td key={p.id} style={{ textAlign: 'center', fontWeight: 800 }}>
                      <div>{formatYears(p.analysis.payback.paybackYears)}</div>
                      {isTop && (
                        <span className="badge badge-amber" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                          <Award size={10} /> Fastest Payback
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* ROI */}
              <tr>
                <td style={{ fontWeight: 800, color: '#7c3aed' }}>
                  Return on Investment (ROI)
                </td>
                {comparedProjects.map((p) => {
                  const isTop = p.analysis.roi.roiPercentage === bestROI && comparedProjects.length > 1;
                  return (
                    <td key={p.id} style={{ textAlign: 'center', fontWeight: 800 }} className="font-mono">
                      <div>{formatPercent(p.analysis.roi.roiPercentage)}</div>
                      {isTop && (
                        <span className="badge badge-purple" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                          <Award size={10} /> Highest ROI
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Break-Even Units */}
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: 700 }}>Break-Even Units</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.analysis.breakEven.isValid && p.analysis.breakEven.breakEvenUnits > 0
                      ? `${p.analysis.breakEven.breakEvenUnits.toLocaleString()} Units`
                      : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Overall Verdict */}
              <tr>
                <td style={{ fontWeight: 700 }}>Feasibility Status</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${p.analysis.feasibility.badgeColor}`}>
                      {p.analysis.feasibility.verdict}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ fontWeight: 700 }}>Deep-Dive Analysis</td>
                {comparedProjects.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => {
                        if (onSelectProject) onSelectProject(p.id);
                        if (onNavigate) onNavigate('metrics');
                      }}
                    >
                      View Details →
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparative Bar Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Chart 1: NPV Comparison */}
        <div className="card" style={{ padding: '18px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
            Net Present Value Comparison
          </h4>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
                <Tooltip formatter={(v) => [formatCurrency(v, currency), 'NPV']} />
                <Bar dataKey="NPV" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: IRR & ROI Yield Comparison */}
        <div className="card" style={{ padding: '18px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
            Rate Comparison: IRR vs. ROI (%)
          </h4>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}%`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar name="IRR (%)" dataKey="IRR" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar name="ROI (%)" dataKey="ROI" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trade-Off Guidance Notice */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} style={{ color: 'var(--brand-teal)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.825rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
          <strong>Investment Decision Principle:</strong> No single metric alone dictates the optimal capital allocation. A project with the highest NPV may require a large initial capital commitment and prolonged payback period, while a project with a lower NPV might offer faster liquidity recovery and lower downside risk. Always synthesize NPV, IRR, and payback in combination with strategic alignment.
        </div>
      </div>
    </div>
  );
}
