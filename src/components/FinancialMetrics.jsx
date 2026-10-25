import React, { useState } from 'react';
import { 
  BarChart3, 
  Percent, 
  Clock, 
  IndianRupee, 
  Target, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  calculateNPV, 
  calculateIRR, 
  calculatePaybackPeriod, 
  calculateROI, 
  calculateBreakEven 
} from '../utils/financialCalculations';
import { formatCurrency, formatPercent, formatYears, formatCompactCurrency } from '../utils/formatters';

export function FinancialMetrics({ 
  project, 
  currency, 
  initialMetric = 'npv' 
}) {
  const [activeMetricTab, setActiveMetricTab] = useState(initialMetric);

  // Interactive slider overrides
  const [overrideDiscountRate, setOverrideDiscountRate] = useState(project?.discountRate || 10);
  const [overridePrice, setOverridePrice] = useState(project?.sellingPrice || 50);
  const [overrideVarCost, setOverrideVarCost] = useState(project?.variableCost || 30);
  const [overrideFixedCost, setOverrideFixedCost] = useState(project?.fixedCosts || 250000);

  if (!project) {
    return (
      <div className="section-wrapper">
        <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
          <Info size={36} style={{ color: 'var(--brand-teal)', margin: '0 auto 12px' }} />
          <h3>No Project Selected</h3>
          <p style={{ color: 'var(--text-muted)' }}>Select or create a project to inspect financial appraisal metrics.</p>
        </div>
      </div>
    );
  }

  const c0 = project.initialInvestment;
  const netCashFlows = (project.cashFlows || []).map((cf) => {
    return typeof cf === 'number' ? cf : (Number(cf.inflow || 0) - Number(cf.outflow || 0));
  });

  const totalInflows = (project.cashFlows || []).reduce((sum, cf) => sum + Number(cf.inflow || 0), 0);
  const totalOpex = (project.cashFlows || []).reduce((sum, cf) => sum + Number(cf.outflow || 0), 0);

  // Metric calculations
  const npvData = calculateNPV(c0, netCashFlows, overrideDiscountRate);
  const irrData = calculateIRR(c0, netCashFlows);
  const paybackData = calculatePaybackPeriod(c0, netCashFlows, overrideDiscountRate);
  const roiData = calculateROI(c0, totalInflows, totalOpex, project.duration);
  const breakEvenData = calculateBreakEven(overrideFixedCost, overridePrice, overrideVarCost, project.projectedUnits);

  // 1. NPV Sensitivity Curve Data (NPV vs Discount Rate from 0% to 30%)
  const npvSensitivityData = [];
  for (let rate = 0; rate <= 28; rate += 2) {
    const res = calculateNPV(c0, netCashFlows, rate);
    npvSensitivityData.push({
      rate: `${rate}%`,
      rateNum: rate,
      npv: Math.round(res.npv),
    });
  }

  // 2. Payback Cumulative Chart Data
  const paybackChartData = [
    { year: 'Yr 0', cumulative: -c0, discountedCumulative: -c0, baseline: 0 },
    ...paybackData.cumulativeCashFlows.map((cf) => ({
      year: `Yr ${cf.year}`,
      cumulative: cf.cumulative - c0,
      discountedCumulative: Math.round(cf.cumulativeDiscounted - c0),
      baseline: 0,
    }))
  ];

  // 3. Break-Even Volume Curve Data
  const breakEvenChartData = [];
  const maxUnits = breakEvenData.isValid && breakEvenData.breakEvenUnits > 0
    ? Math.max(breakEvenData.breakEvenUnits * 2, project.projectedUnits || 10000)
    : 20000;
  const step = Math.max(100, Math.floor(maxUnits / 10));

  for (let u = 0; u <= maxUnits; u += step) {
    const rev = u * overridePrice;
    const tc = overrideFixedCost + (u * overrideVarCost);
    breakEvenChartData.push({
      units: u.toLocaleString(),
      Revenue: rev,
      TotalCost: tc,
      FixedCost: overrideFixedCost,
    });
  }

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <div>
          <h1 className="section-title">Financial Metrics Deep-Dive</h1>
          <p className="section-subtitle">
            Evaluating <strong>{project.name}</strong> across the five gold-standard investment appraisal techniques.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-light)' }}>
          {[
            { id: 'npv', label: 'NPV', icon: BarChart3 },
            { id: 'irr', label: 'IRR', icon: Percent },
            { id: 'payback', label: 'Payback', icon: Clock },
            { id: 'roi', label: 'ROI', icon: IndianRupee },
            { id: 'breakeven', label: 'Break-Even', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeMetricTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMetricTab(tab.id)}
                className="btn btn-sm"
                style={{
                  background: isSel ? 'var(--brand-teal)' : 'transparent',
                  color: isSel ? 'white' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC 1: NET PRESENT VALUE (NPV) */}
      {activeMetricTab === 'npv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            {/* Left: Result & Formula Card */}
            <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="badge badge-teal" style={{ marginBottom: '8px' }}>Capital Budgeting</span>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)' }}>Net Present Value (NPV)</h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  The sum of discounted future cash inflows minus the initial capital investment outlay.
                </p>
              </div>

              {/* Calculated Primary Result */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Calculated Net Present Value
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: npvData.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)', marginTop: '4px' }}>
                  {formatCurrency(npvData.npv, currency)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.8rem', color: npvData.isProfitable ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  <CheckCircle size={15} />
                  <span style={{ fontWeight: 600 }}>
                    {npvData.isProfitable ? 'Feasible: Project creates net shareholder wealth.' : 'Unfavorable: Project destroys value at chosen discount rate.'}
                  </span>
                </div>
              </div>

              {/* Mathematical Formula Box */}
              <div style={{ background: '#f8fafc', borderLeft: '3px solid var(--brand-teal)', padding: '12px 14px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Mathematical Formula
                </div>
                <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-heading)', margin: '4px 0' }}>
                  NPV = ∑ [ Cₜ / (1 + r)ᵗ ] − C₀
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Where Cₜ = Net Cash Flow at Year t, r = Discount Rate ({overrideDiscountRate}%), C₀ = Initial Outlay ({formatCurrency(c0, currency)}).
                </div>
              </div>

              {/* Interactive Discount Rate Sandbox Slider */}
              <div style={{ padding: '12px', background: 'var(--bg-active)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    Interactive Hurdle Rate Slider:
                  </span>
                  <span className="badge badge-teal" style={{ fontSize: '0.8rem' }}>{overrideDiscountRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={overrideDiscountRate}
                  onChange={(e) => setOverrideDiscountRate(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--brand-teal)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>0% (Undiscounted)</span>
                  <span>10% (Baseline)</span>
                  <span>25% (High Risk)</span>
                </div>
              </div>
            </div>

            {/* Right: NPV Sensitivity Profile Curve Chart */}
            <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>NPV Discount Rate Sensitivity Curve</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Shows how Net Present Value responds as the cost of capital varies. The horizontal zero crossover is the exact IRR!
                </p>
              </div>

              <div style={{ height: '240px', width: '100%', marginTop: '8px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={npvSensitivityData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="rate" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
                    <Tooltip 
                      formatter={(v) => [formatCurrency(v, currency), 'Net Present Value']} 
                      labelFormatter={(l) => `Discount Rate: ${l}`}
                    />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'NPV = 0 (IRR Boundary)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                    <Line type="monotone" dataKey="npv" stroke="#0d9488" strokeWidth={3} dot={{ r: 3, fill: '#0d9488' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Profitability Index Pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Profitability Index (Benefit/Cost Ratio)</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {npvData.profitabilityIndex !== Infinity ? npvData.profitabilityIndex.toFixed(2) : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PV of Future Inflows</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-teal)' }}>
                    {formatCurrency(npvData.pvOfInflows, currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discounted Cash Flow Breakdown Schedule */}
          <div className="card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Discounted Cash Flow Schedule (Year by Year)</h4>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Nominal Cash Flow</th>
                    <th>Discount Factor (1 / (1+r)ᵗ)</th>
                    <th>Discounted Present Value</th>
                    <th>Cumulative Present Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                    <td>Year 0</td>
                    <td className="font-mono" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(c0, currency)}</td>
                    <td className="font-mono">1.0000</td>
                    <td className="font-mono" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(c0, currency)}</td>
                    <td className="font-mono" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(c0, currency)}</td>
                  </tr>
                  {npvData.discountedCashFlows.map((dcf, idx) => {
                    const cumPV = npvData.discountedCashFlows.slice(0, idx + 1).reduce((s, it) => s + it.discounted, -c0);
                    return (
                      <tr key={dcf.year}>
                        <td style={{ fontWeight: 600 }}>Year {dcf.year}</td>
                        <td className="font-mono">{formatCurrency(dcf.nominal, currency)}</td>
                        <td className="font-mono">{dcf.discountFactor.toFixed(4)}</td>
                        <td className="font-mono" style={{ fontWeight: 700, color: dcf.discounted >= 0 ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                          {formatCurrency(dcf.discounted, currency)}
                        </td>
                        <td className="font-mono" style={{ fontWeight: 700, color: cumPV >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {formatCurrency(cumPV, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* METRIC 2: INTERNAL RATE OF RETURN (IRR) */}
      {activeMetricTab === 'irr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: '8px' }}>Yield Metric</span>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)' }}>Internal Rate of Return (IRR)</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                The annualized effective compound return rate at which Net Present Value (NPV) equals zero.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-card)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Computed Internal Rate of Return
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {irrData.irr !== null ? `${irrData.irr}%` : 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.8rem', color: irrData.irr >= project.discountRate ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {irrData.irr >= project.discountRate ? (
                  <>
                    <CheckCircle size={15} />
                    <span>Exceeds project hurdle rate of {project.discountRate}% by +{(irrData.irr - project.discountRate).toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} />
                    <span>Below hurdle rate of {project.discountRate}%</span>
                  </>
                )}
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderLeft: '3px solid #0284c7', padding: '12px 14px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Mathematical Definition
              </div>
              <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-heading)', margin: '4px 0' }}>
                0 = ∑ [ Cₜ / (1 + IRR)ᵗ ] − C₀
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Solved via Hybrid Newton-Raphson polynomial iteration with bounded bisection safeguard.
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Algorithmic Status:</strong> {irrData.message}
            </div>
          </div>

          {/* Right: Hurdle Rate Benchmark Bar */}
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Hurdle Rate vs. Project Yield Benchmark</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Comparing IRR against cost of capital and typical risk-free industry benchmarks.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Project IRR</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-teal)' }}>{irrData.irr}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (irrData.irr / 30) * 100)}%`, height: '100%', background: 'var(--brand-teal)', borderRadius: 'var(--radius-pill)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Discount Rate / Hurdle Target</span>
                  <span style={{ fontWeight: 800 }}>{project.discountRate}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (project.discountRate / 30) * 100)}%`, height: '100%', background: '#64748b', borderRadius: 'var(--radius-pill)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Risk-Free 10-Yr Sovereign Yield</span>
                  <span style={{ fontWeight: 800 }}>7.1%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div style={{ width: `${(7.1 / 30) * 100}%`, height: '100%', background: '#94a3b8', borderRadius: 'var(--radius-pill)' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', background: 'var(--brand-teal-light)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--brand-teal)' }}>
              <strong>Executive Takeaway:</strong> With an IRR of {irrData.irr}%, this initiative generates an excess risk spread of {(irrData.irr - project.discountRate).toFixed(1)}% above the required cost of capital.
            </div>
          </div>
        </div>
      )}

      {/* METRIC 3: PAYBACK PERIOD */}
      {activeMetricTab === 'payback' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: '8px' }}>Capital Liquidity</span>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)' }}>Payback Period</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                The time required for cumulative project cash flows to completely recover the initial investment.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>UNDISCOUNTED PAYBACK</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                  {formatYears(paybackData.paybackYears)}
                </div>
                <div style={{ fontSize: '0.72rem', color: paybackData.isRecovered ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {paybackData.isRecovered ? 'Capital fully recouped' : 'Unrecovered in period'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>DISCOUNTED PAYBACK</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-teal)', marginTop: '4px' }}>
                  {formatYears(paybackData.discountedPaybackYears)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  At {overrideDiscountRate}% discount rate
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderLeft: '3px solid #d97706', padding: '12px 14px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Recovery Interpolation Formula
              </div>
              <div className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)', margin: '4px 0' }}>
                Payback = (Years before recovery) + [ Unrecovered Balance / Cash Flow in Recovery Year ]
              </div>
            </div>
          </div>

          {/* Right: Cumulative Recovery Chart */}
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Cumulative Cash Recovery Curve</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tracks progress toward capital break-even (crossing the horizontal zero line).
            </p>

            <div style={{ height: '220px', width: '100%', marginTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paybackChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
                  <Tooltip formatter={(v) => [formatCurrency(v, currency), '']} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Full Payback Threshold', fill: '#ef4444', fontSize: 10 }} />
                  <Line name="Nominal Cumulative" type="monotone" dataKey="cumulative" stroke="#059669" strokeWidth={2.5} />
                  <Line name="Discounted Cumulative" type="monotone" dataKey="discountedCumulative" stroke="#0284c7" strokeWidth={2.5} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* METRIC 4: RETURN ON INVESTMENT (ROI) */}
      {activeMetricTab === 'roi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '8px' }}>Efficiency Ratio</span>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)' }}>Return on Investment (ROI)</h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Measures the net profitability generated relative to total capital and operational expenditure.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL COST ROI</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-teal)', marginTop: '4px' }}>
                  {formatPercent(roiData.roiPercentage)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Total Cost: {formatCurrency(roiData.totalCost, currency)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>ANNUALIZED ROI (CAGR)</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                  {formatPercent(roiData.annualizedRoi)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Compound annual growth
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderLeft: '3px solid #7c3aed', padding: '12px 14px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Standard Formula
              </div>
              <div className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)', margin: '4px 0' }}>
                ROI = [ (Total Benefits − Total Costs) / Total Costs ] × 100%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Total Net Profit = {formatCurrency(roiData.netProfit, currency)} over {project.duration} years.
              </div>
            </div>
          </div>

          {/* Right: Benefits vs Costs Breakdown */}
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Benefits & Cost Structure</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Gross Operating Inflows:</span>
                  <strong className="font-mono">{formatCurrency(roiData.totalBenefits, currency)}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Initial Capital Outlay (C₀):</span>
                  <strong className="font-mono">{formatCurrency(c0, currency)}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Total Operating Opex:</span>
                  <strong className="font-mono">{formatCurrency(roiData.totalOperatingCosts, currency)}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--brand-emerald-light)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-emerald-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--brand-emerald)' }}>
                  <strong>Cumulative Net Profit:</strong>
                  <strong className="font-mono" style={{ fontSize: '1.1rem' }}>{formatCurrency(roiData.netProfit, currency)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METRIC 5: BREAK-EVEN ANALYSIS */}
      {activeMetricTab === 'breakeven' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            {/* Left: Break-Even Calculations & Inputs */}
            <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="badge badge-rose" style={{ marginBottom: '8px' }}>Cost-Volume-Profit</span>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)' }}>Break-Even Analysis</h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Determines the volume and sales revenue threshold at which total costs equal total revenue.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>BREAK-EVEN UNITS</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '4px' }}>
                    {breakEvenData.isValid && breakEvenData.breakEvenUnits > 0
                      ? `${breakEvenData.breakEvenUnits.toLocaleString()} Units`
                      : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Minimum sales required
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>BREAK-EVEN REVENUE</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                    {formatCurrency(breakEvenData.breakEvenRevenue, currency)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Turnover required
                  </div>
                </div>
              </div>

              {/* Sliders to tweak price & cost */}
              <div style={{ background: 'var(--bg-active)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Selling Price per Unit:</span>
                    <strong>{formatCurrency(overridePrice, currency)}</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={overridePrice}
                    onChange={(e) => setOverridePrice(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--brand-teal)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Variable Cost per Unit:</span>
                    <strong>{formatCurrency(overrideVarCost, currency)}</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max={overridePrice - 1}
                    step="1"
                    value={overrideVarCost}
                    onChange={(e) => setOverrideVarCost(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-danger)' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>Annual Fixed Overhead Costs:</span>
                    <strong>{formatCurrency(overrideFixedCost, currency)}</strong>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max={Math.max(500000, overrideFixedCost * 2)}
                    step="10000"
                    value={overrideFixedCost}
                    onChange={(e) => setOverrideFixedCost(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#94a3b8' }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Break-Even Crossover Chart */}
            <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Cost-Volume-Profit Crossover Chart</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Visualizes Fixed Costs, Total Costs, and Total Revenue across sales volume.
              </p>

              <div style={{ height: '240px', width: '100%', marginTop: '8px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={breakEvenChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="units" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
                    <Tooltip formatter={(v) => [formatCurrency(v, currency), '']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line name="Total Revenue" type="monotone" dataKey="Revenue" stroke="#059669" strokeWidth={2.5} />
                    <Line name="Total Cost" type="monotone" dataKey="TotalCost" stroke="#e11d48" strokeWidth={2.5} />
                    <Line name="Fixed Cost" type="monotone" dataKey="FixedCost" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Contribution Margin & Margin of Safety */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contribution Margin / Unit:</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-teal)' }}>
                    {formatCurrency(breakEvenData.contributionMargin, currency)} ({breakEvenData.contributionMarginRatio}%)
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Margin of Safety:</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: breakEvenData.marginOfSafetyPercentage > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {breakEvenData.marginOfSafetyPercentage}% ({breakEvenData.marginOfSafetyUnits.toLocaleString()} Units)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
