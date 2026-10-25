"""
InvestWise - Python Flask REST API
Connects to MySQL database and performs investment appraisal calculations.
"""

import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Project, CashFlow, User

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# MySQL Database URI Configuration (falls back to local SQLite if MySQL env is not set)
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASS = os.getenv('MYSQL_PASSWORD', 'root')
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_PORT = os.getenv('MYSQL_PORT', '3306')
MYSQL_DB = os.getenv('MYSQL_DATABASE', 'investwise_db')

# Default to SQLite for easy immediate testing, or switch to MySQL
USE_MYSQL = os.getenv('USE_MYSQL', 'false').lower() == 'true'

if USE_MYSQL:
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASS}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///investwise.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()


# --- Mathematical Helper Functions ---
def calc_npv(initial, flows, rate):
    r = rate / 100.0
    pv = sum(cf / ((1 + r) ** (i + 1)) for i, cf in enumerate(flows))
    return pv - initial

def calc_irr(initial, flows):
    if initial <= 0 or not flows:
        return None
    # Bisection search between -0.9 and 5.0 (500%)
    low = -0.9
    high = 5.0
    tol = 1e-5
    
    npv_low = calc_npv(initial, flows, low * 100)
    npv_high = calc_npv(initial, flows, high * 100)
    
    if npv_low * npv_high > 0:
        return None
        
    for _ in range(100):
        mid = (low + high) / 2
        npv_mid = calc_npv(initial, flows, mid * 100)
        if abs(npv_mid) < tol or (high - low) / 2 < tol:
            return round(mid * 100, 2)
        if npv_low * npv_mid < 0:
            high = mid
        else:
            low = mid
            npv_low = npv_mid
    return round(mid * 100, 2)


# --- REST API Endpoints ---

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': 'mysql' if USE_MYSQL else 'sqlite_fallback',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })


@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = Project.query.order_by(Project.updated_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])


@app.route('/api/projects', methods=['POST'])
def save_project():
    data = request.json or {}
    proj_id = data.get('id') or f"proj_{int(datetime.utcnow().timestamp())}"
    
    project = Project.query.get(proj_id)
    if not project:
        project = Project(id=proj_id)
        db.session.add(project)

    project.name = data.get('name', 'Untitled Analysis')
    project.category = data.get('category', 'General')
    project.description = data.get('description', '')
    project.initial_investment = float(data.get('initialInvestment', 0))
    project.duration = int(data.get('duration', 5))
    project.discount_rate = float(data.get('discountRate', 10.0))
    project.fixed_costs = float(data.get('fixedCosts', 0))
    project.selling_price = float(data.get('sellingPrice', 0))
    project.variable_cost = float(data.get('variableCost', 0))
    project.projected_units = int(data.get('projectedUnits', 0))
    project.status = data.get('status', 'Active')

    # Update cash flows
    CashFlow.query.filter_by(project_id=proj_id).delete()
    for idx, cf in enumerate(data.get('cashFlows', [])):
        inflow = float(cf.get('inflow', 0) if isinstance(cf, dict) else (cf if cf > 0 else 0))
        outflow = float(cf.get('outflow', 0) if isinstance(cf, dict) else (abs(cf) if cf < 0 else 0))
        note = cf.get('note', f"Year {idx + 1}") if isinstance(cf, dict) else f"Year {idx + 1}"
        db.session.add(CashFlow(
            project_id=proj_id,
            year=idx + 1,
            inflow=inflow,
            outflow=outflow,
            note=note
        ))

    db.session.commit()
    return jsonify(project.to_dict()), 201


@app.route('/api/projects/<proj_id>', methods=['GET'])
def get_project(proj_id):
    project = Project.query.get_or_404(proj_id)
    return jsonify(project.to_dict())


@app.route('/api/projects/<proj_id>', methods=['DELETE'])
def delete_project(proj_id):
    project = Project.query.get_or_404(proj_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'})


@app.route('/api/calculate', methods=['POST'])
def calculate_metrics():
    data = request.json or {}
    initial = float(data.get('initialInvestment', 0))
    rate = float(data.get('discountRate', 10.0))
    flows = [float(f) for f in data.get('cashFlows', [])]

    npv = calc_npv(initial, flows, rate)
    irr = calc_irr(initial, flows)

    return jsonify({
        'npv': round(npv, 2),
        'irr': irr,
        'discountRate': rate,
        'isProfitable': npv > 0
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"InvestWise Flask REST API running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
