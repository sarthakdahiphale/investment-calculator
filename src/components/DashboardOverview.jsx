import React from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  GitCompare, 
  FileText, 
  CheckCircle, 
  ArrowUpRight, 
  FolderKanban,
  Percent,
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
import { formatCurrency, formatPercent, formatYears, formatCompactCurrency } from '../utils/formatters';
import { analyzeProject } from '../utils/financialCalculations';

export function DashboardOverview({ 
  projects, 
  activeProject, 
  onSelectProject, 
  onNavigate, 
  currency 
}) {
  // Pre-calculate metrics for all projects
  const analyzedProjects = projects.map((p) => {
    const analysis = analyzeProject(p);
    return {
      ...p,
      analysis,
    };
  });

  const totalProjects = analyzedProjects.length;
  const profitableProjects = analyzedProjects.filter((p) => p.analysis.npv.isProfitable).length;
  const profitablePercent = totalProjects > 0 ? (profitableProjects / totalProjects) * 100 : 0;
  
  const totalNPV = analyzedProjects.reduce((sum, p) => sum + p.analysis.npv.npv, 0);
  const avgNPV = totalProjects > 0 ? totalNPV / totalProjects : 0;
  
  const validROIs = analyzedProjects.filter((p) => p.analysis.roi.roiPercentage !== null);
  const avgROI = validROIs.length > 0 ? validROIs.reduce((sum, p) => sum + p.analysis.roi.roiPercentage, 0) / validROIs.length : 0;

  // Active project analysis
  const activeAnalysis = activeProject ? analyzeProject(activeProject) : null;

  // Cash flow chart data for the active project
  const cashFlowChartData = activeProject ? [
    {
      year: 'Year 0',
      nominal: -activeProject.initialInvestment,
      discounted: -activeProject.initialInvestment,
      cumulative: -activeProject.initialInvestment,
    },
    ...(activeProject.cashFlows || []).map((cf, idx) => {
      const year = idx + 1;
      const net = typeof cf === 'number' ? cf : (Number(cf.inflow || 0) - Number(cf.outflow || 0));
      const factor = Math.pow(1 + (activeProject.discountRate / 100), year);
      const discounted = net / factor;
      
      const cumItem = activeAnalysis?.payback?.cumulativeCashFlows?.[idx];
      return {
        year: `Year ${year}`,
        nominal: net,
        discounted: Math.round(discounted),
        cumulative: cumItem ? cumItem.cumulative - activeProject.initialInvestment : 0,
      };
    })
  ] : [];

  return (
    <div className="section-wrapper">
      {/* Top Header & Quick Actions */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Investment Portfolio Overview</h1>
          <p className="section-subtitle">
            Executive feasibility metrics and cash flow performance across all appraised projects.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('comparison')}
          >
            <GitCompare size={15} />
            <span>Compare Projects</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('reports')}
          >
            <FileText size={15} />
            <span>Generate Report</span>
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

      {/* KPI Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Card 1: Total Projects */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Projects Analyzed</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-teal-light)', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderKanban size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '6px' }}>
            {totalProjects}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span className="badge badge-teal" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>Portfolio Active</span>
            <span>4 Sample Models</span>
          </div>
        </div>

        {/* Card 2: Profitable Projects */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Profitable Projects (NPV &gt; 0)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '6px' }}>
            {profitableProjects} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalProjects}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-success)' }}>
            <ArrowUpRight size={14} />
            <span style={{ fontWeight: 700 }}>{profitablePercent.toFixed(0)}% Feasible Rate</span>
          </div>
        </div>

        {/* Card 3: Average ROI */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Average Return on Inv (ROI)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '6px' }}>
            {formatPercent(avgROI, 1)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Across full project horizons</span>
          </div>
        </div>

        {/* Card 4: Average NPV */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Average Net Present Value</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: avgNPV >= 0 ? 'var(--brand-teal)' : 'var(--color-danger)', marginTop: '6px' }}>
            {formatCompactCurrency(avgNPV, currency)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Discounted at hurdle rates</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Project Chart + Investment Performance Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
        {/* Left: Cash Flow Trend & Value Recovery Chart */}
        <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Cash Flow Dynamics: {activeProject?.name || 'Active Project'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Comparing nominal cash inflows vs. discounted present value at {activeProject?.discountRate}% discount rate.
              </p>
            </div>
            {activeProject?.isSample && (
              <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                <Info size={11} /> Sample Demonstration Data
              </span>
            )}
          </div>

          <div style={{ height: '240px', width: '100%', marginTop: '6px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickFormatter={(val) => formatCompactCurrency(val, currency)}
                />
                <Tooltip 
                  formatter={(val) => [formatCurrency(val, currency), '']}
                  labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                <Bar name="Nominal Cash Flow" dataKey="nominal" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar name="Discounted Present Value" dataKey="discounted" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Active Project Feasibility Score & Quick Verdict */}
        {activeProject && activeAnalysis && (
          <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em' }}>
                  Project Appraisal Status
                </span>
                <span className={`badge badge-${activeAnalysis.feasibility.badgeColor}`}>
                  {activeAnalysis.feasibility.verdict}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {activeProject.name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                {activeProject.description}
              </p>
            </div>

            {/* Quick Metrics Bar in Active Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Net Present Value (NPV)</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: activeAnalysis.npv.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                  {formatCurrency(activeAnalysis.npv.npv, currency)}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Internal Rate of Return</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  {activeAnalysis.irr.irr !== null ? `${activeAnalysis.irr.irr}%` : 'N/A'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Payback Period</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  {formatYears(activeAnalysis.payback.paybackYears)}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Return on Inv (ROI)</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  {formatPercent(activeAnalysis.roi.roiPercentage)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => onNavigate('metrics')}
              >
                <span>Explore Metrics</span>
                <ArrowUpRight size={14} />
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('scenarios')}
              >
                <span>Scenarios</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Investment Analyses Table */}
      <div className="card" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Investment Appraisals</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click any project to switch active appraisal or inspect calculations.
            </p>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('saved')}
          >
            <span>View All ({projects.length})</span>
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Category</th>
                <th>Initial Outlay</th>
                <th>Discount Rate</th>
                <th>NPV</th>
                <th>IRR</th>
                <th>Payback</th>
                <th>ROI</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {analyzedProjects.slice(0, 5).map((p) => {
                const isActive = activeProject?.id === p.id;
                return (
                  <tr key={p.id} style={{ background: isActive ? 'var(--brand-teal-light)' : 'transparent' }}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isActive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-teal)' }} />}
                        <span>{p.name}</span>
                        {p.isSample && <span className="badge badge-neutral" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>Sample</span>}
                      </div>
                    </td>
                    <td>{p.category || 'General'}</td>
                    <td className="font-mono">{formatCurrency(p.initialInvestment, currency)}</td>
                    <td>{p.discountRate}%</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: p.analysis.npv.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                      {formatCurrency(p.analysis.npv.npv, currency)}
                    </td>
                    <td className="font-mono">
                      {p.analysis.irr.irr !== null ? `${p.analysis.irr.irr}%` : '—'}
                    </td>
                    <td>{formatYears(p.analysis.payback.paybackYears)}</td>
                    <td className="font-mono" style={{ color: p.analysis.roi.roiPercentage > 0 ? 'var(--color-success)' : 'inherit' }}>
                      {formatPercent(p.analysis.roi.roiPercentage)}
                    </td>
                    <td>
                      <span className={`badge badge-${p.analysis.feasibility.badgeColor}`}>
                        {p.analysis.feasibility.verdict}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => {
                          onSelectProject(p.id);
                          onNavigate('metrics');
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
