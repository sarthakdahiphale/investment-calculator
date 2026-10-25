import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  calculateNPV, 
  calculateIRR, 
  calculatePaybackPeriod, 
  calculateROI 
} from '../utils/financialCalculations';
import { formatCurrency, formatPercent, formatYears, formatCompactCurrency } from '../utils/formatters';

export function ScenarioAnalysis({ project, currency }) {
  // Scenario adjustments in percentages
  const [optimisticAdj, setOptimisticAdj] = useState({
    inflowDelta: 15, // +15%
    outflowDelta: -5, // -5%
    rateDelta: -1.0, // -1% hurdle
  });

  const [pessimisticAdj, setPessimisticAdj] = useState({
    inflowDelta: -20, // -20%
    outflowDelta: 10, // +10%
    rateDelta: 2.0, // +2% hurdle
  });

  if (!project) {
    return (
      <div className="section-wrapper">
        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          <h3>No Project Active</h3>
          <p style={{ color: 'var(--text-muted)' }}>Select a project to run scenario sensitivity stress-testing.</p>
        </div>
      </div>
    );
  }

  const c0 = project.initialInvestment;
  const baseFlows = project.cashFlows || [];
  const baseDiscount = project.discountRate;

  // Function to build scenario cash flows
  const evaluateScenario = (inflowPct, outflowPct, rateDelta) => {
    const adjustedFlows = baseFlows.map((cf) => {
      const origIn = typeof cf === 'number' ? (cf > 0 ? cf : 0) : Number(cf.inflow || 0);
      const origOut = typeof cf === 'number' ? (cf < 0 ? Math.abs(cf) : 0) : Number(cf.outflow || 0);

      const adjIn = origIn * (1 + inflowPct / 100);
      const adjOut = origOut * (1 + outflowPct / 100);
      return adjIn - adjOut;
    });

    const totalIn = baseFlows.reduce((s, cf) => s + (Number(cf.inflow || 0) * (1 + inflowPct / 100)), 0);
    const totalOut = baseFlows.reduce((s, cf) => s + (Number(cf.outflow || 0) * (1 + outflowPct / 100)), 0);

    const effectiveRate = Math.max(0.5, baseDiscount + rateDelta);
    const npv = calculateNPV(c0, adjustedFlows, effectiveRate);
    const irr = calculateIRR(c0, adjustedFlows);
    const payback = calculatePaybackPeriod(c0, adjustedFlows, effectiveRate);
    const roi = calculateROI(c0, totalIn, totalOut, project.duration);

    return {
      effectiveRate,
      npv,
      irr,
      payback,
      roi,
      adjustedFlows,
    };
  };

  const expectedCase = evaluateScenario(0, 0, 0);
  const optimisticCase = evaluateScenario(optimisticAdj.inflowDelta, optimisticAdj.outflowDelta, optimisticAdj.rateDelta);
  const pessimisticCase = evaluateScenario(pessimisticAdj.inflowDelta, pessimisticAdj.outflowDelta, pessimisticAdj.rateDelta);

  // Scenario Bar Chart Data
  const scenarioChartData = [
    {
      scenario: 'Pessimistic Case',
      NPV: Math.round(pessimisticCase.npv.npv),
      IRR: pessimisticCase.irr.irr || 0,
      ROI: Math.round(pessimisticCase.roi.roiPercentage),
    },
    {
      scenario: 'Expected (Base)',
      NPV: Math.round(expectedCase.npv.npv),
      IRR: expectedCase.irr.irr || 0,
      ROI: Math.round(expectedCase.roi.roiPercentage),
    },
    {
      scenario: 'Optimistic Case',
      NPV: Math.round(optimisticCase.npv.npv),
      IRR: optimisticCase.irr.irr || 0,
      ROI: Math.round(optimisticCase.roi.roiPercentage),
    },
  ];

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <div>
          <h1 className="section-title">Scenario & Sensitivity Stress Testing</h1>
          <p className="section-subtitle">
            Evaluate how fluctuations in cash revenues, operational costs, and hurdle rates impact <strong>{project.name}</strong>.
          </p>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setOptimisticAdj({ inflowDelta: 15, outflowDelta: -5, rateDelta: -1.0 });
            setPessimisticAdj({ inflowDelta: -20, outflowDelta: 10, rateDelta: 2.0 });
          }}
        >
          <RotateCcw size={14} />
          <span>Reset Scenarios</span>
        </button>
      </div>

      {/* 3 Scenario Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* SCENARIO 1: PESSIMISTIC */}
        <div className="card" style={{ padding: '20px', borderTop: '4px solid var(--color-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingDown size={18} />
              <span>Pessimistic Case</span>
            </span>
            <span className="badge badge-rose">Stress Test</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Demand contraction, cost overruns, or macroeconomic interest rate increases.
          </p>

          {/* Sliders */}
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span>Inflow Adjustment:</span>
                <strong style={{ color: 'var(--color-danger)' }}>{pessimisticAdj.inflowDelta}%</strong>
              </div>
              <input
                type="range"
                min="-40"
                max="-5"
                step="5"
                value={pessimisticAdj.inflowDelta}
                onChange={(e) => setPessimisticAdj({ ...pessimisticAdj, inflowDelta: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-danger)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span>Cost Outflow Inflation:</span>
                <strong style={{ color: 'var(--color-danger)' }}>+{pessimisticAdj.outflowDelta}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={pessimisticAdj.outflowDelta}
                onChange={(e) => setPessimisticAdj({ ...pessimisticAdj, outflowDelta: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-danger)' }}
              />
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NPV:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: pessimisticCase.npv.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                {formatCurrency(pessimisticCase.npv.npv, currency)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IRR:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {pessimisticCase.irr.irr !== null ? `${pessimisticCase.irr.irr}%` : 'N/A'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payback:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {formatYears(pessimisticCase.payback.paybackYears)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ROI:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {formatPercent(pessimisticCase.roi.roiPercentage)}
              </div>
            </div>
          </div>
        </div>

        {/* SCENARIO 2: EXPECTED (BASE) */}
        <div className="card" style={{ padding: '20px', borderTop: '4px solid var(--brand-teal)', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={18} />
              <span>Expected Case (Base)</span>
            </span>
            <span className="badge badge-teal">Current Project Baseline</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Current business plan assumptions and baseline hurdle rate of {baseDiscount}%.
          </p>

          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <em>Baseline parameters: No artificial variance applied.</em>
          </div>

          {/* Results Grid */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NPV:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: expectedCase.npv.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                {formatCurrency(expectedCase.npv.npv, currency)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IRR:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {expectedCase.irr.irr !== null ? `${expectedCase.irr.irr}%` : 'N/A'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payback:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {formatYears(expectedCase.payback.paybackYears)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ROI:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {formatPercent(expectedCase.roi.roiPercentage)}
              </div>
            </div>
          </div>
        </div>

        {/* SCENARIO 3: OPTIMISTIC */}
        <div className="card" style={{ padding: '20px', borderTop: '4px solid var(--brand-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={18} />
              <span>Optimistic Case</span>
            </span>
            <span className="badge badge-emerald">Growth Upside</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Faster client adoption, operational synergies, and premium pricing realization.
          </p>

          {/* Sliders */}
          <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span>Inflow Growth:</span>
                <strong style={{ color: 'var(--brand-emerald)' }}>+{optimisticAdj.inflowDelta}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={optimisticAdj.inflowDelta}
                onChange={(e) => setOptimisticAdj({ ...optimisticAdj, inflowDelta: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--brand-emerald)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span>Opex Reduction:</span>
                <strong style={{ color: 'var(--brand-emerald)' }}>{optimisticAdj.outflowDelta}%</strong>
              </div>
              <input
                type="range"
                min="-20"
                max="0"
                step="2"
                value={optimisticAdj.outflowDelta}
                onChange={(e) => setOptimisticAdj({ ...optimisticAdj, outflowDelta: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--brand-emerald)' }}
              />
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NPV:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-emerald)' }}>
                {formatCurrency(optimisticCase.npv.npv, currency)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IRR:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {optimisticCase.irr.irr !== null ? `${optimisticCase.irr.irr}%` : 'N/A'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payback:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {formatYears(optimisticCase.payback.paybackYears)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ROI:</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {formatPercent(optimisticCase.roi.roiPercentage)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Bar Chart Comparison */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
          Scenario NPV Sensitivity Spread
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Visualizing potential range of outcomes between downside risk and upside expansion.
        </p>

        <div style={{ height: '230px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarioChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="scenario" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
              <Tooltip formatter={(v) => [formatCurrency(v, currency), 'NPV']} />
              <Bar dataKey="NPV" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
