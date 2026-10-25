# InvestWise — Investment Appraisal Calculator

**InvestWise** is a modern, responsive, financial SaaS web application designed to evaluate the profitability, risk, and capital feasibility of business investments and corporate projects using **Net Present Value (NPV)**, **Internal Rate of Return (IRR)**, **Payback Period**, **Return on Investment (ROI)**, and **Break-Even Analysis**.

Built with **React.js**, **Vite**, **Lucide Icons**, and **Recharts**, featuring a clean, professional financial UI (white and light ice blue background `#f0f7fa`, teal `#0d9488` and emerald `#059669` accents, and dark navy headings `#0f172a`).

---

## Key Highlights & Architectural Features

### 1. Fixed Application Shell (No Long-Scrolling Dashboard)
In strict accordance with modern financial SaaS standards:
- **Desktop Layout**: Uses a fixed-height layout fitting the viewport (`height: 100vh; overflow: hidden;`), featuring a fixed top navigation bar and persistent left sidebar.
- **Section-Wise Navigation**: Only the active section is rendered in the main viewport. No long vertical scrolling through the entire dashboard!
- **Independent Scroll Areas**: When a table or section needs extra space, clean internal scrollbars are used.

### 2. Beautiful Landing Page
Accurately mirrors the product design with:
- Top branding and section links: Home, Calculator, Features, How It Works, About.
- Hero headline: *"Make Smarter Investment Decisions"* — **Investment Appraisal Calculator**.
- Floating live metric badges:
  - **NPV**: ₹ 2,45,000 *(Positive Value)*
  - **IRR**: 18.6% *(Higher than required hurdle)*
  - **Payback Period**: 3.2 Years *(Quick Recovery)*
  - **ROI**: 27.5% *(Good Return)*
  - **Break-Even**: 12,500 Units *(Covers Total Costs)*
- Interactive mini preview board with project overview bars, cash flow donut, and cumulative recovery curves.
- Five dedicated metric cards with *"Calculate →"* direct links.

### 3. Five Core Financial Metric Calculators
1. **Net Present Value (NPV)**: $\sum \frac{C_t}{(1+r)^t} - C_0$, dynamic discount rate slider, and sensitivity curve showing the zero-NPV crossing.
2. **Internal Rate of Return (IRR)**: Robust hybrid Newton-Raphson + Bisection numerical algorithm with sign-change validation.
3. **Payback Period**: Exact fractional year interpolation for both **undiscounted** and **discounted** recovery.
4. **Return on Investment (ROI)**: Total cost ROI, capital investment ROI, and annualized compound rate (CAGR).
5. **Break-Even Analysis**: Contribution margin, contribution margin ratio, break-even unit sales, break-even revenue, and margin of safety.

### 4. Comprehensive Section Modules
- **Dashboard Overview**: KPI metric summaries, cash flow vs. discounted value chart, feasibility status badge, and recent appraisals table.
- **New Analysis**: Structured 4-step wizard form (Project Details, Cash Flows, Cost & Revenue, Review & Calculate) with dynamic annual cash flow rows and live validation.
- **Project Comparison**: Multi-project side-by-side benchmark matrix and comparative bar charts.
- **Scenario Analysis**: 3 editable cases (Optimistic, Expected, Pessimistic) with sliders to stress-test revenue, costs, and hurdle rates.
- **Saved Projects**: Searchable, filterable, sortable table with Duplicate, Edit, Delete (with confirmation), and CSV export.
- **Reports**: Audit-ready executive appraisal report with printable stylesheet (`window.print()`) and CSV schedule download.
- **Settings**: Currency selection (₹ INR default, $ USD, € EUR, £ GBP), number formatting (Indian Lakhs/Crores vs Western Millions), default hurdle rate, and Flask API configuration.

### 5. Backend Integration: Python Flask & MySQL Ready
- **Offline First**: Runs completely in client storage with pre-seeded realistic demonstration projects.
- **Backend Included**: The `backend/` folder provides a Python Flask REST API (`app.py`), SQLAlchemy models (`models.py`), and a MySQL database schema (`schema.sql`).

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python (v3.10+, optional for backend)

### 1. Run Frontend
```bash
# In the project root directory
npm install
npm run dev
```
Open your browser at the displayed local URL (typically `http://localhost:5173`).

### 2. Run Backend (Optional)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Flask will start at `http://127.0.0.1:5000`. In the frontend, the backend status pill will automatically switch to **Flask API Online**!

---

## Project Structure
```
Invest/
├── backend/
│   ├── app.py              # Flask REST API endpoints
│   ├── models.py           # SQLAlchemy User, Project, CashFlow models
│   ├── schema.sql          # MySQL database DDL schema
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
├── public/                 # Static assets & favicons
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Dashboard topbar & project switcher
│   │   ├── Sidebar.jsx             # Fixed persistent 8-section navigation
│   │   ├── LandingPage.jsx         # Hero & 5 financial metric cards
│   │   ├── DashboardOverview.jsx   # Executive portfolio overview
│   │   ├── NewAnalysis.jsx         # 4-step structured form wizard
│   │   ├── FinancialMetrics.jsx    # Deep-dive explorer for NPV, IRR, etc.
│   │   ├── ProjectComparison.jsx   # Multi-project benchmark matrix & charts
│   │   ├── ScenarioAnalysis.jsx    # Optimistic / Expected / Pessimistic
│   │   ├── SavedProjects.jsx       # Search, sort, duplicate, delete table
│   │   ├── Reports.jsx             # Print-ready appraisal report & CSV
│   │   ├── Settings.jsx            # Currency, numbers & Flask config
│   │   └── BackendModal.jsx        # Full-stack docs & connection test
│   ├── services/
│   │   ├── storageService.js       # LocalStorage persistence & sample seed
│   │   └── apiService.js           # Flask REST client with offline fallback
│   ├── utils/
│   │   ├── financialCalculations.js # NPV, IRR, Payback, ROI, Break-Even
│   │   ├── formatters.js           # INR ₹, USD, EUR, Lakhs/Crores formatters
│   │   └── sampleData.js           # 4 realistic demonstration projects
│   ├── App.css                     # Fixed viewport shell & responsive styles
│   ├── App.jsx                     # Core application orchestrator
│   ├── index.css                   # Design tokens, typography & components
│   └── main.jsx                    # React entrypoint
├── index.html
├── package.json
└── vite.config.js
```
