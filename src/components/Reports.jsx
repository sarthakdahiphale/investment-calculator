import React, { useState } from 'react';
import { 
  Printer, 
  Download,
  TrendingUp
} from 'lucide-react';
import { analyzeProject } from '../utils/financialCalculations';
import { formatCurrency, formatPercent, formatYears, formatDate } from '../utils/formatters';

export function Reports({ projects, activeProject, currency, onSelectProject }) {
  const [selectedProjectId, setSelectedProjectId] = useState(activeProject?.id || projects[0]?.id || null);
  const [reportDate] = useState(() => formatDate(new Date().toISOString()));

  const project = projects.find((p) => p.id === selectedProjectId) || activeProject || projects[0];

  if (!project) {
    return (
      <div className="section-wrapper">
        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          <h3>No Project Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>Create an investment project first to generate appraisal reports.</p>
        </div>
      </div>
    );
  }

  const analysis = analyzeProject(project);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Period', 'Inflow', 'Outflow', 'Net Flow', 'Discount Factor', 'Discounted Value', 'Cumulative'];
    const rows = (project.cashFlows || []).map((cf, idx) => {
      const year = idx + 1;
      const dcfItem = analysis.npv.discountedCashFlows[idx];
      const cumItem = analysis.payback.cumulativeCashFlows[idx];
      return [
        `Year ${year}`,
        typeof cf === 'number' ? (cf > 0 ? cf : 0) : Number(cf.inflow || 0),
        typeof cf === 'number' ? 0 : Number(cf.outflow || 0),
        dcfItem ? dcfItem.nominal : 0,
        dcfItem ? dcfItem.discountFactor.toFixed(4) : 0,
        dcfItem ? Math.round(dcfItem.discounted) : 0,
        cumItem ? Math.round(cumItem.cumulative) : 0,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      `Project Appraisal Report: "${project.name}"`,
      `Initial Investment,${project.initialInvestment}`,
      `Discount Rate,${project.discountRate}%`,
      `NPV,${Math.round(analysis.npv.npv)}`,
      `IRR,${analysis.irr.irr !== null ? `${analysis.irr.irr}%` : 'N/A'}`,
      `Payback Period,${analysis.payback.paybackYears}`,
      `ROI,${analysis.roi.roiPercentage}%`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_Appraisal_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="section-wrapper">
      {/* Top Header - hidden in print */}
      <div className="section-header no-print">
        <div>
          <h1 className="section-title">Investment Appraisal Report Generator</h1>
          <p className="section-subtitle">
            Generate printable, audit-ready executive reports and export financial schedules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Switch Project Dropdown */}
          <select
            className="form-control"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              onSelectProject(e.target.value);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                Report: {p.name}
              </option>
            ))}
          </select>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* PRINT-READY REPORT CONTAINER */}
      <div 
        className="card report-print-container"
        style={{
          padding: '36px',
          background: 'white',
          boxShadow: 'var(--shadow-card)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Report Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-light)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
                <TrendingUp size={16} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                Invest<span>Wise</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Financial Appraisal Suite</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-heading)', marginTop: '6px' }}>
              Executive Investment Appraisal
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Project: <strong style={{ color: 'var(--text-heading)' }}>{project.name}</strong> ({project.category})
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div><strong>Report Date:</strong> {reportDate}</div>
            <div><strong>Appraisal ID:</strong> {project.id}</div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge badge-${analysis.feasibility.badgeColor}`} style={{ fontSize: '0.75rem' }}>
                Status: {analysis.feasibility.verdict}
              </span>
            </div>
          </div>
        </div>

        {/* Project Description & Executive Summary */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-heading)' }}>1. Executive Summary</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: 1.6, background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            {project.description || 'This financial appraisal evaluates capital outlay, operational returns, discount hurdles, and downside sensitivity for the proposed venture. All discounted cash flows reflect current market parameters and hurdle benchmarks.'}
          </p>
        </div>

        {/* 5 Core Metrics Matrix */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: 'var(--text-heading)' }}>2. Core Financial Feasibility Metrics</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {/* NPV */}
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>NPV</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: analysis.npv.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)', marginTop: '4px' }}>
                {formatCurrency(analysis.npv.npv, currency)}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>@ {project.discountRate}% hurdle</span>
            </div>

            {/* IRR */}
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>IRR</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {analysis.irr.irr !== null ? `${analysis.irr.irr}%` : 'N/A'}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Internal Return</span>
            </div>

            {/* Payback */}
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>PAYBACK</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {formatYears(analysis.payback.paybackYears)}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Discounted: {formatYears(analysis.payback.discountedPaybackYears)}</span>
            </div>

            {/* ROI */}
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>ROI</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {formatPercent(analysis.roi.roiPercentage)}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Cost Basis</span>
            </div>

            {/* Break-Even */}
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>BREAK-EVEN</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {analysis.breakEven.isValid && analysis.breakEven.breakEvenUnits > 0
                  ? `${analysis.breakEven.breakEvenUnits.toLocaleString()}`
                  : 'N/A'}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Units Threshold</span>
            </div>
          </div>
        </div>

        {/* Input Assumptions Table */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '10px', color: 'var(--text-heading)' }}>3. Input Assumptions & Parameters</h3>
          <div className="data-table-container">
            <table className="data-table">
              <tbody>
                <tr>
                  <td style={{ width: '40%', fontWeight: 600 }}>Initial Capital Investment (Year 0 Outlay)</td>
                  <td className="font-mono">{formatCurrency(project.initialInvestment, currency)}</td>
                  <td style={{ width: '40%', fontWeight: 600 }}>Analysis Lifecycle Horizon</td>
                  <td>{project.duration} Years</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Discount Rate / Required WACC</td>
                  <td className="font-mono">{project.discountRate}%</td>
                  <td style={{ fontWeight: 600 }}>Annual Fixed Costs</td>
                  <td className="font-mono">{formatCurrency(project.fixedCosts, currency)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Unit Selling Price</td>
                  <td className="font-mono">{formatCurrency(project.sellingPrice, currency)}</td>
                  <td style={{ fontWeight: 600 }}>Unit Variable Cost</td>
                  <td className="font-mono">{formatCurrency(project.variableCost, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Flow Schedule */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '10px', color: 'var(--text-heading)' }}>4. Cash Flow & Present Value Schedule</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Inflow</th>
                  <th>Outflow</th>
                  <th>Net Nominal Flow</th>
                  <th>Discount Factor</th>
                  <th>Discounted Value</th>
                  <th>Cumulative Position</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                  <td>Year 0</td>
                  <td>—</td>
                  <td className="font-mono">{formatCurrency(project.initialInvestment, currency)}</td>
                  <td className="font-mono" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(project.initialInvestment, currency)}</td>
                  <td className="font-mono">1.0000</td>
                  <td className="font-mono" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(project.initialInvestment, currency)}</td>
                  <td className="font-mono" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(project.initialInvestment, currency)}</td>
                </tr>
                {project.cashFlows?.map((cf, idx) => {
                  const year = idx + 1;
                  const dcfItem = analysis.npv.discountedCashFlows[idx];
                  const cumItem = analysis.payback.cumulativeCashFlows[idx];
                  const net = typeof cf === 'number' ? cf : (Number(cf.inflow || 0) - Number(cf.outflow || 0));
                  return (
                    <tr key={year}>
                      <td style={{ fontWeight: 600 }}>Year {year}</td>
                      <td className="font-mono">{formatCurrency(typeof cf === 'number' ? cf : cf.inflow, currency)}</td>
                      <td className="font-mono">{formatCurrency(typeof cf === 'number' ? 0 : cf.outflow, currency)}</td>
                      <td className="font-mono" style={{ fontWeight: 600, color: net >= 0 ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                        {formatCurrency(net, currency)}
                      </td>
                      <td className="font-mono">{dcfItem ? dcfItem.discountFactor.toFixed(4) : '—'}</td>
                      <td className="font-mono" style={{ fontWeight: 700, color: dcfItem?.discounted >= 0 ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                        {dcfItem ? formatCurrency(dcfItem.discounted, currency) : '—'}
                      </td>
                      <td className="font-mono" style={{ color: cumItem?.cumulative >= project.initialInvestment ? 'var(--color-success)' : 'inherit' }}>
                        {cumItem ? formatCurrency(cumItem.cumulative - project.initialInvestment, currency) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Limitations & Recommendation */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-heading)' }}>5. Interpretation & Decision Rationale</h3>
          <div style={{ background: 'var(--brand-teal-light)', border: '1px solid var(--brand-teal-border)', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <ul style={{ paddingLeft: '20px' }}>
              {analysis.feasibility.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sign-off Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '24px', marginTop: '36px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>
            <div>Prepared By: <strong>Investment Appraisal Analyst</strong></div>
            <div>InvestWise Financial Analysis Engine</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>Approved Signature: ______________________</div>
            <div>Chief Financial Officer / Investment Committee</div>
          </div>
        </div>
      </div>
    </div>
  );
}
