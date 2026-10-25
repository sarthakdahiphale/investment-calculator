import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  HelpCircle, 
  AlertCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { formatCurrency, formatPercent, formatYears } from '../utils/formatters';
import { analyzeProject } from '../utils/financialCalculations';

function getInitialFormData(editingProject, defaultDiscountRate) {
  if (editingProject) {
    return {
      name: editingProject.name || '',
      category: editingProject.category || 'General',
      description: editingProject.description || '',
      initialInvestment: editingProject.initialInvestment || 0,
      duration: editingProject.duration || 5,
      discountRate: editingProject.discountRate ?? defaultDiscountRate,
      cashFlows: editingProject.cashFlows && editingProject.cashFlows.length > 0
        ? editingProject.cashFlows.map((cf, idx) => ({
            year: idx + 1,
            inflow: typeof cf === 'number' ? (cf > 0 ? cf : 0) : Number(cf.inflow || 0),
            outflow: typeof cf === 'number' ? (cf < 0 ? Math.abs(cf) : 0) : Number(cf.outflow || 0),
            note: cf.note || `Year ${idx + 1}`,
          }))
        : [],
      fixedCosts: editingProject.fixedCosts || 0,
      sellingPrice: editingProject.sellingPrice || 0,
      variableCost: editingProject.variableCost || 0,
      projectedUnits: editingProject.projectedUnits || 0,
    };
  }
  return {
    name: '',
    category: 'Renewable Energy',
    description: '',
    initialInvestment: 500000,
    duration: 5,
    discountRate: defaultDiscountRate,
    cashFlows: [
      { year: 1, inflow: 180000, outflow: 40000, note: 'Year 1 operations' },
      { year: 2, inflow: 210000, outflow: 45000, note: 'Year 2 ramp up' },
      { year: 3, inflow: 240000, outflow: 50000, note: 'Year 3 steady state' },
      { year: 4, inflow: 260000, outflow: 55000, note: 'Year 4 capacity expansion' },
      { year: 5, inflow: 280000, outflow: 60000, note: 'Year 5 harvest' },
    ],
    fixedCosts: 180000,
    sellingPrice: 100,
    variableCost: 60,
    projectedUnits: 10000,
  };
}

export function NewAnalysis({ 
  onSaveProject, 
  currency, 
  editingProject, 
  onCancel,
  defaultDiscountRate = 10.0
}) {
  const [currentTab, setCurrentTab] = useState('details'); // 'details' | 'cashflows' | 'costrevenue' | 'review'
  const [errors, setErrors] = useState({});

  // Form State initialized cleanly from editingProject or default
  const [formData, setFormData] = useState(() => getInitialFormData(editingProject, defaultDiscountRate));

  // Adjust cash flows array if duration changes
  const handleDurationChange = (newDuration) => {
    const dur = Math.max(1, Math.min(15, Number(newDuration) || 1));
    const currentFlows = [...formData.cashFlows];
    
    if (dur > currentFlows.length) {
      // Append missing years with smart default
      const lastFlow = currentFlows[currentFlows.length - 1] || { inflow: 200000, outflow: 50000 };
      for (let i = currentFlows.length + 1; i <= dur; i++) {
        currentFlows.push({
          year: i,
          inflow: Math.round(lastFlow.inflow * 1.05),
          outflow: Math.round(lastFlow.outflow * 1.03),
          note: `Year ${i}`,
        });
      }
    } else if (dur < currentFlows.length) {
      currentFlows.length = dur;
    }

    setFormData({
      ...formData,
      duration: dur,
      cashFlows: currentFlows,
    });
  };

  const handleCashFlowChange = (index, field, value) => {
    const updated = [...formData.cashFlows];
    updated[index] = {
      ...updated[index],
      [field]: field === 'note' ? value : Number(value) || 0,
    };
    setFormData({ ...formData, cashFlows: updated });
  };

  const handleAddYear = () => {
    const nextYear = formData.cashFlows.length + 1;
    const last = formData.cashFlows[formData.cashFlows.length - 1] || { inflow: 200000, outflow: 50000 };
    setFormData({
      ...formData,
      duration: nextYear,
      cashFlows: [
        ...formData.cashFlows,
        {
          year: nextYear,
          inflow: Math.round(last.inflow * 1.05),
          outflow: Math.round(last.outflow * 1.03),
          note: `Year ${nextYear}`,
        },
      ],
    });
  };

  const handleRemoveYear = (index) => {
    if (formData.cashFlows.length <= 1) return;
    const updated = formData.cashFlows.filter((_, i) => i !== index).map((cf, idx) => ({
      ...cf,
      year: idx + 1,
    }));
    setFormData({
      ...formData,
      duration: updated.length,
      cashFlows: updated,
    });
  };

  // Validation
  const validateTab = (tab) => {
    const newErrors = {};
    if (tab === 'details' || tab === 'all') {
      if (!formData.name.trim()) newErrors.name = 'Project name is required';
      if (formData.initialInvestment <= 0) newErrors.initialInvestment = 'Initial capital outlay must be greater than zero';
      if (formData.discountRate <= 0) newErrors.discountRate = 'Discount rate must be positive (e.g. 10%)';
    }
    if (tab === 'cashflows' || tab === 'all') {
      if (!formData.cashFlows || formData.cashFlows.length === 0) {
        newErrors.cashFlows = 'At least 1 year of cash flow is required';
      }
    }
    if (tab === 'costrevenue' || tab === 'all') {
      if (formData.sellingPrice > 0 && formData.variableCost >= formData.sellingPrice) {
        newErrors.variableCost = 'Variable cost must be less than selling price for positive margin';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentTab === 'details') {
      if (validateTab('details')) setCurrentTab('cashflows');
    } else if (currentTab === 'cashflows') {
      if (validateTab('cashflows')) setCurrentTab('costrevenue');
    } else if (currentTab === 'costrevenue') {
      if (validateTab('costrevenue')) setCurrentTab('review');
    }
  };

  const handlePrev = () => {
    if (currentTab === 'cashflows') setCurrentTab('details');
    else if (currentTab === 'costrevenue') setCurrentTab('cashflows');
    else if (currentTab === 'review') setCurrentTab('costrevenue');
  };

  const handleSave = (isDraft = false) => {
    if (!isDraft && !validateTab('all')) {
      alert('Please correct the validation errors before calculating results.');
      return;
    }

    const projectPayload = {
      ...(editingProject ? { id: editingProject.id } : {}),
      name: formData.name || 'Untitled Analysis',
      category: formData.category,
      description: formData.description,
      initialInvestment: Number(formData.initialInvestment),
      duration: Number(formData.duration),
      discountRate: Number(formData.discountRate),
      cashFlows: formData.cashFlows,
      fixedCosts: Number(formData.fixedCosts),
      sellingPrice: Number(formData.sellingPrice),
      variableCost: Number(formData.variableCost),
      projectedUnits: Number(formData.projectedUnits),
      status: isDraft ? 'Draft' : 'Active',
    };

    onSaveProject(projectPayload);
  };

  // Instant calculation preview for the Review tab
  const analysisPreview = analyzeProject(formData);

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            {editingProject ? `Edit Analysis: ${editingProject.name}` : 'New Investment Appraisal'}
          </h1>
          <p className="section-subtitle">
            Configure financial assumptions, dynamic annual cash flows, and cost structures.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {editingProject && (
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => handleSave(true)}
            title="Save as Draft"
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* 4-Tab Stepper Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: 'var(--radius-lg)' }}>
        {[
          { id: 'details', label: '1. Project Details', desc: 'Capital & Hurdle Rate' },
          { id: 'cashflows', label: '2. Cash Flows', desc: 'Annual Inflows & Costs' },
          { id: 'costrevenue', label: '3. Cost & Revenue', desc: 'Break-Even Inputs' },
          { id: 'review', label: '4. Review & Calculate', desc: 'Summary & Feasibility' },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (validateTab(currentTab)) setCurrentTab(tab.id);
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: 'none',
                background: isActive ? 'var(--brand-teal-light)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                borderBottom: isActive ? '2px solid var(--brand-teal)' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? 'var(--brand-teal)' : 'var(--text-heading)' }}>
                {tab.label}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {tab.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROJECT DETAILS */}
      {currentTab === 'details' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} style={{ color: 'var(--brand-teal)' }} />
            <span>Core Investment Parameters</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                <span>Project / Venture Name *</span>
                <span className="tooltip-trigger" title="Descriptive title of the opportunity">
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Automated Warehouse Robotic Line"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error"><AlertCircle size={12} /> {errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Category / Sector</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Renewable Energy">Renewable Energy & ESG</option>
                <option value="Software & Technology">Software & Technology</option>
                <option value="Manufacturing">Manufacturing & Automation</option>
                <option value="Infrastructure">Infrastructure & Logistics</option>
                <option value="Real Estate">Commercial Real Estate</option>
                <option value="Healthcare">Healthcare & BioTech</option>
                <option value="Retail">Retail & E-commerce</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Initial Capital Outlay (C₀) *</span>
                <span className="tooltip-trigger" title="Total upfront investment required at Year 0">
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                type="number"
                className="form-control font-mono"
                value={formData.initialInvestment}
                onChange={(e) => setFormData({ ...formData, initialInvestment: Number(e.target.value) })}
              />
              <span className="form-helper">Formatted: {formatCurrency(formData.initialInvestment, currency)}</span>
              {errors.initialInvestment && <span className="form-error"><AlertCircle size={12} /> {errors.initialInvestment}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Required Discount Rate / WACC (%) *</span>
                <span className="tooltip-trigger" title="The minimum hurdle rate required by investors (cost of capital)">
                  <HelpCircle size={14} />
                </span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  className="form-control font-mono"
                  value={formData.discountRate}
                  onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                />
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
              </div>
              <span className="form-helper">Used to compute Net Present Value & Discounted Payback</span>
              {errors.discountRate && <span className="form-error"><AlertCircle size={12} /> {errors.discountRate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Analysis Horizon (Years)</span>
                <span className="tooltip-trigger" title="Number of operating years to evaluate">
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="15"
                className="form-control"
                value={formData.duration}
                onChange={(e) => handleDurationChange(e.target.value)}
              />
              <span className="form-helper">Supports 1 to 15 years lifecycle appraisal</span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="form-label">Project Scope & Strategic Rationale</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Outline project objectives, market drivers, key assumptions, and risk mitigations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* TAB 2: CASH FLOWS */}
      {currentTab === 'cashflows' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--brand-teal)' }} />
                <span>Annual Cash Flow Projections</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Enter expected annual operational inflows and ongoing maintenance/operating expenses.
              </p>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleAddYear}
            >
              <Plus size={15} />
              <span>Add Year {formData.cashFlows.length + 1}</span>
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Period</th>
                  <th>Expected Inflows ({currency})</th>
                  <th>Operating Outflows ({currency})</th>
                  <th>Net Annual Flow ({currency})</th>
                  <th>Milestone / Operational Note</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.cashFlows.map((cf, idx) => {
                  const net = Number(cf.inflow || 0) - Number(cf.outflow || 0);
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>Year {cf.year}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control font-mono"
                          style={{ padding: '6px 10px', fontSize: '0.825rem' }}
                          value={cf.inflow}
                          onChange={(e) => handleCashFlowChange(idx, 'inflow', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control font-mono"
                          style={{ padding: '6px 10px', fontSize: '0.825rem' }}
                          value={cf.outflow}
                          onChange={(e) => handleCashFlowChange(idx, 'outflow', e.target.value)}
                        />
                      </td>
                      <td className="font-mono" style={{ fontWeight: 700, color: net >= 0 ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                        {formatCurrency(net, currency)}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ padding: '6px 10px', fontSize: '0.825rem' }}
                          placeholder={`Year ${cf.year} milestones`}
                          value={cf.note || ''}
                          onChange={(e) => handleCashFlowChange(idx, 'note', e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {formData.cashFlows.length > 1 && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)', padding: '4px' }}
                            onClick={() => handleRemoveYear(idx)}
                            title="Remove Year"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COST & REVENUE (BREAK-EVEN INPUTS) */}
      {currentTab === 'costrevenue' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} style={{ color: 'var(--color-danger)' }} />
            <span>Cost & Revenue Structure (Break-Even Analysis)</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            These parameters evaluate volume sensitivity, contribution margins, and the unit sales break-even threshold.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                <span>Annual Fixed Costs (FC)</span>
                <span className="tooltip-trigger" title="Costs that do not vary with production volume (rent, administrative overhead, salaries)">
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                type="number"
                className="form-control font-mono"
                value={formData.fixedCosts}
                onChange={(e) => setFormData({ ...formData, fixedCosts: Number(e.target.value) })}
              />
              <span className="form-helper">Formatted: {formatCurrency(formData.fixedCosts, currency)}</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Selling Price per Unit (P)</span>
                <span className="tooltip-trigger" title="Average invoice / realization price per product or service unit">
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                type="number"
                className="form-control font-mono"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
              />
              <span className="form-helper">Must exceed variable cost for positive contribution margin</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Variable Cost per Unit (V)</span>
                <span className="tooltip-trigger" title="Direct raw materials, labor, and packaging per unit">
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                type="number"
                className="form-control font-mono"
                value={formData.variableCost}
                onChange={(e) => setFormData({ ...formData, variableCost: Number(e.target.value) })}
              />
              {errors.variableCost && <span className="form-error"><AlertCircle size={12} /> {errors.variableCost}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Projected Annual Sales Volume (Units)</span>
                <span className="tooltip-trigger" title="Target sales units to compute Margin of Safety">
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                type="number"
                className="form-control font-mono"
                value={formData.projectedUnits}
                onChange={(e) => setFormData({ ...formData, projectedUnits: Number(e.target.value) })}
              />
              <span className="form-helper">Used to evaluate safety buffer above break-even</span>
            </div>
          </div>

          {/* Quick Real-Time Contribution Preview */}
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Contribution Margin / Unit</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: formData.sellingPrice > formData.variableCost ? 'var(--brand-teal)' : 'var(--color-danger)' }}>
                {formatCurrency(Math.max(0, formData.sellingPrice - formData.variableCost), currency)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Contribution Margin Ratio</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {formData.sellingPrice > 0 ? `${(((formData.sellingPrice - formData.variableCost) / formData.sellingPrice) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Break-Even Units Required</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {formData.sellingPrice > formData.variableCost && formData.fixedCosts > 0
                  ? Math.ceil(formData.fixedCosts / (formData.sellingPrice - formData.variableCost)).toLocaleString()
                  : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW & CALCULATE */}
      {currentTab === 'review' && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--brand-emerald)' }} />
                <span>Executive Appraisal Feasibility Preview</span>
              </h3>
              <span className={`badge badge-${analysisPreview.feasibility.badgeColor}`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                {analysisPreview.feasibility.verdict} (Score: {analysisPreview.feasibility.score}/100)
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Verify your investment assumptions and calculated financial indicators before saving to the portfolio.
            </p>
          </div>

          {/* 5 Financial Metric Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {/* NPV */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>NET PRESENT VALUE (NPV)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: analysisPreview.npv.isProfitable ? 'var(--brand-teal)' : 'var(--color-danger)', marginTop: '4px' }}>
                {formatCurrency(analysisPreview.npv.npv, currency)}
              </div>
              <div style={{ fontSize: '0.725rem', color: analysisPreview.npv.isProfitable ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '2px' }}>
                {analysisPreview.npv.isProfitable ? 'Creates Shareholder Value' : 'Destroys Capital Value'}
              </div>
            </div>

            {/* IRR */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>INTERNAL RATE OF RETURN</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {analysisPreview.irr.irr !== null ? `${analysisPreview.irr.irr}%` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Hurdle: {formData.discountRate}%
              </div>
            </div>

            {/* Payback */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYBACK PERIOD</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {formatYears(analysisPreview.payback.paybackYears)}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Discounted: {formatYears(analysisPreview.payback.discountedPaybackYears)}
              </div>
            </div>

            {/* ROI */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>RETURN ON INVESTMENT (ROI)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {formatPercent(analysisPreview.roi.roiPercentage)}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Net Profit: {formatCurrency(analysisPreview.roi.netProfit, currency)}
              </div>
            </div>

            {/* Break-Even */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)' }}>BREAK-EVEN UNITS</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {analysisPreview.breakEven.isValid && analysisPreview.breakEven.breakEvenUnits > 0
                  ? `${analysisPreview.breakEven.breakEvenUnits.toLocaleString()} Units`
                  : 'N/A'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Revenue: {formatCurrency(analysisPreview.breakEven.breakEvenRevenue, currency)}
              </div>
            </div>
          </div>

          {/* Rationale Bullet Points */}
          <div style={{ background: 'var(--brand-teal-light)', border: '1px solid var(--brand-teal-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <h4 style={{ color: 'var(--brand-teal)', fontSize: '0.875rem', marginBottom: '8px' }}>
              Feasibility Assessment Drivers:
            </h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
              {analysisPreview.feasibility.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Buttons Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <div>
          {currentTab !== 'details' && (
            <button className="btn btn-secondary" onClick={handlePrev}>
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (window.confirm('Reset this form to initial baseline inputs?')) {
                setFormData({
                  name: '',
                  category: 'Renewable Energy',
                  description: '',
                  initialInvestment: 500000,
                  duration: 5,
                  discountRate: defaultDiscountRate,
                  cashFlows: [
                    { year: 1, inflow: 180000, outflow: 40000, note: 'Year 1' },
                    { year: 2, inflow: 210000, outflow: 45000, note: 'Year 2' },
                    { year: 3, inflow: 240000, outflow: 50000, note: 'Year 3' },
                    { year: 4, inflow: 260000, outflow: 55000, note: 'Year 4' },
                    { year: 5, inflow: 280000, outflow: 60000, note: 'Year 5' },
                  ],
                  fixedCosts: 180000,
                  sellingPrice: 100,
                  variableCost: 60,
                  projectedUnits: 10000,
                });
                setCurrentTab('details');
              }
            }}
          >
            <RotateCcw size={15} />
            <span>Reset Form</span>
          </button>

          {currentTab !== 'review' ? (
            <button className="btn btn-primary" onClick={handleNext}>
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              className="btn btn-emerald btn-lg"
              onClick={() => handleSave(false)}
              id="btn-calculate-and-save"
            >
              <CheckCircle2 size={18} />
              <span>Calculate & Save Project</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
