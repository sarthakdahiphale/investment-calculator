import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Percent, 
  Clock, 
  IndianRupee, 
  Target,
  Server,
  Database,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export function LandingPage({ onStartAnalysis, onOpenMetric, onOpenBackendModal }) {
  const [activeTab, setActiveTab] = useState('home');

  // Mini demo data for the hero preview
  const previewBarData = [
    { year: 'Yr 0', value: 0 },
    { year: 'Yr 1', value: 1.9 },
    { year: 'Yr 2', value: 2.3 },
    { year: 'Yr 3', value: 2.7 },
    { year: 'Yr 4', value: 3.1 },
    { year: 'Yr 5', value: 3.5 },
  ];

  const previewCumulativeData = [
    { year: 'Yr 0', cum: -350 },
    { year: 'Yr 1', cum: -150 },
    { year: 'Yr 2', cum: 80 },
    { year: 'Yr 3', cum: 350 },
    { year: 'Yr 4', cum: 660 },
    { year: 'Yr 5', cum: 1010 },
  ];

  const previewPieData = [
    { name: 'Initial Investment', value: 40, color: '#0d9488' },
    { name: 'Operating Inflows', value: 45, color: '#0284c7' },
    { name: 'Operating Outflows', value: 15, color: '#38bdf8' },
  ];

  return (
    <div className="landing-shell">
      {/* Top Navigation */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <div className="brand-icon-box">
            <TrendingUp size={22} />
          </div>
          <span className="brand-title">Invest<span>Wise</span></span>
        </div>

        <ul className="landing-links">
          <li>
            <a href="#home" className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
              Home
            </a>
          </li>
          <li>
            <a href="#calculator" onClick={(e) => { e.preventDefault(); onStartAnalysis('new-analysis'); }}>
              Calculator
            </a>
          </li>
          <li>
            <a href="#features" onClick={() => setActiveTab('features')}>
              Features
            </a>
          </li>
          <li>
            <a href="#how-it-works" onClick={() => setActiveTab('how-it-works')}>
              How It Works
            </a>
          </li>
          <li>
            <a href="#about" onClick={() => setActiveTab('about')}>
              About
            </a>
          </li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => onStartAnalysis('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className="btn btn-emerald btn-sm"
            onClick={() => onStartAnalysis('new-analysis')}
            id="landing-get-started-btn"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-container" id="home">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <TrendingUp size={14} />
            <span>Make Smarter Investment Decisions</span>
          </div>

          <h1 className="hero-title">
            Investment Appraisal
            <span className="highlight">Calculator</span>
          </h1>

          <p className="hero-subtext">
            Analyze and evaluate your investment ideas with key financial metrics like NPV, IRR, Payback Period, ROI and Break-Even Analysis. Make data-driven decisions for a more profitable future.
          </p>

          <div className="hero-actions">
            <button 
              className="btn btn-emerald btn-lg"
              onClick={() => onStartAnalysis('new-analysis')}
              id="landing-start-analysis-btn"
            >
              <span>Start Investment Analysis</span>
              <ArrowRight size={18} />
            </button>
            <button 
              className="btn btn-secondary btn-lg"
              onClick={() => {
                const el = document.getElementById('key-metrics');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Explore Features</span>
            </button>
          </div>

          <div className="hero-features-row">
            <div className="feature-check-item">
              <div className="icon-circle" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Zap size={16} />
              </div>
              <span>Quick & Accurate Calculations</span>
            </div>
            <div className="feature-check-item">
              <div className="icon-circle" style={{ background: '#ecfdf5', color: '#059669' }}>
                <BarChart3 size={16} />
              </div>
              <span>Visual Insights & Charts</span>
            </div>
            <div className="feature-check-item">
              <div className="icon-circle" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                <ShieldCheck size={16} />
              </div>
              <span>Easy to Use & Reliable</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Dashboard Illustration (Exact match to prompt screenshot!) */}
        <div className="hero-mockup-stage">
          {/* Floating Metric Badge 1: NPV (Top Left) */}
          <div className="floating-badge floating-npv" onClick={() => onOpenMetric('npv')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>NPV</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>₹ 2,45,000</div>
              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Positive Value</div>
            </div>
          </div>

          {/* Floating Metric Badge 2: IRR (Top Right) */}
          <div className="floating-badge floating-irr" onClick={() => onOpenMetric('irr')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>IRR</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>18.6%</div>
              <div style={{ fontSize: '0.7rem', color: '#0891b2', fontWeight: 600 }}>Higher than required</div>
            </div>
          </div>

          {/* Central Mockup Device Shell */}
          <div className="hero-dashboard-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '8px', fontWeight: 600 }}>InvestWise Financial Workspace</span>
            </div>

            <div className="mockup-inner">
              <div className="mockup-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} style={{ color: '#0d9488' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>Solar Plant Feasibility</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Feasible (Score: 85/100)</span>
              </div>

              <div className="mockup-grid">
                {/* Mini Bar Chart */}
                <div className="mockup-mini-box">
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Project Overview (Net Cash Flows)
                  </div>
                  <div style={{ height: '80px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={previewBarData} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                        <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Bar dataKey="value" fill="#0d9488" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mini Donut Chart */}
                <div className="mockup-mini-box">
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Cash Flow Distribution
                  </div>
                  <div style={{ height: '80px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={previewPieData} innerRadius={22} outerRadius={34} paddingAngle={4} dataKey="value">
                          {previewPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Mini Cumulative Line Chart */}
              <div className="mockup-mini-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Cumulative Cash Recovery</span>
                  <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>Breakeven: Yr 3.2</span>
                </div>
                <div style={{ height: '70px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={previewCumulativeData} margin={{ top: 2, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Line type="monotone" dataKey="cum" stroke="#059669" strokeWidth={2.5} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Metric Badge 3: Payback Period (Bottom Left) */}
          <div className="floating-badge floating-payback" onClick={() => onOpenMetric('payback')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Payback Period</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>3.2 Years</div>
              <div style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 600 }}>Quick Recovery</div>
            </div>
          </div>

          {/* Floating Metric Badge 4: ROI (Middle Right) */}
          <div className="floating-badge floating-roi" onClick={() => onOpenMetric('roi')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>ROI</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>27.5%</div>
              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Good Return</div>
            </div>
          </div>

          {/* Floating Metric Badge 5: Break-Even (Bottom Right) */}
          <div className="floating-badge floating-breakeven" onClick={() => onOpenMetric('breakeven')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Break-Even</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>12,500 Units</div>
              <div style={{ fontSize: '0.7rem', color: '#e11d48', fontWeight: 600 }}>Covers Total Costs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Financial Metrics Section (Direct match to uploaded image!) */}
      <section className="landing-metrics-section" id="key-metrics">
        <div className="section-intro-center">
          <h2>Key Financial Metrics</h2>
          <p>Evaluate investment opportunities using proven financial analysis techniques</p>
        </div>

        <div className="five-metrics-grid">
          {/* 1. NPV */}
          <div className="landing-metric-card" onClick={() => onOpenMetric('npv')}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Net Present Value (NPV)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Calculate the present value of future cash flows and determine the true value of your investment.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>Calculate</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 2. IRR */}
          <div className="landing-metric-card" onClick={() => onOpenMetric('irr')}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Percent size={24} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Internal Rate of Return (IRR)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Find the rate of return that makes the net present value zero and benchmark against hurdle rates.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>Calculate</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 3. Payback Period */}
          <div className="landing-metric-card" onClick={() => onOpenMetric('payback')}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Payback Period
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Determine how long it takes to recover your initial capital from undiscounted and discounted cash flows.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>Calculate</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 4. Return on Investment (ROI) */}
          <div className="landing-metric-card" onClick={() => onOpenMetric('roi')}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <IndianRupee size={24} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Return on Investment (ROI)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Measure the overall profitability and annualized return of your project as an objective percentage.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>Calculate</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 5. Break-Even Analysis */}
          <div className="landing-metric-card" onClick={() => onOpenMetric('breakeven')}>
            <div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Target size={24} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Break-Even Analysis
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Find the minimum units and revenue threshold where total sales revenue exactly covers total costs.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e11d48', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>Calculate</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ background: '#ffffff', padding: '60px 24px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }} id="how-it-works">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-intro-center">
            <h2>How InvestWise Works</h2>
            <p>Three straightforward steps to professional investment appraisal</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px' }}>
                1
              </div>
              <h3 style={{ marginBottom: '8px' }}>Enter Project Details & Cash Flows</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Specify your initial outlay, duration in years, required discount rate, and dynamic annual operating inflows and outflows.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-emerald)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px' }}>
                2
              </div>
              <h3 style={{ marginBottom: '8px' }}>Automated Precision Appraisal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                InvestWise immediately computes exact NPV, hybrid Newton-Raphson IRR, payback periods, ROI, and break-even thresholds.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-cyan)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px' }}>
                3
              </div>
              <h3 style={{ marginBottom: '8px' }}>Compare, Simulate & Export</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Benchmark competing projects side-by-side, stress-test with 3-case scenario modeling, and generate print-ready executive PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Backend Integration Banner */}
      <section style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 24px', width: '100%' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          borderRadius: '20px', 
          padding: '36px', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 16px 36px -8px rgba(15, 23, 42, 0.25)'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Server size={16} /> Python Flask REST API & MySQL Ready
            </div>
            <h3 style={{ fontSize: '1.6rem', color: 'white', marginBottom: '10px' }}>
              Full Stack Financial Architecture
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Works seamlessly out-of-the-box in client storage mode with realistic demo projects, and features a plug-and-play Python Flask backend schema for production enterprise persistence.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              onClick={onOpenBackendModal}
            >
              <Database size={16} />
              <span>Backend Docs & Schema</span>
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => onStartAnalysis('dashboard')}
            >
              <span>Launch App Shell</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-light)', padding: '36px 24px 24px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon-box" style={{ width: '28px', height: '28px' }}>
              <TrendingUp size={16} />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>InvestWise</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— Investment Appraisal Calculator</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <a href="#home">Home</a>
            <a href="#key-metrics">Financial Metrics</a>
            <a href="#how-it-works">How It Works</a>
            <button onClick={onOpenBackendModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', font: 'inherit' }}>
              Backend Integration
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
            © 2026 InvestWise. Clean Financial SaaS Dashboard.
          </div>
        </div>
      </footer>
    </div>
  );
}
