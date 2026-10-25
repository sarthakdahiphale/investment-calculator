"""
InvestWise - SQLAlchemy Data Models for MySQL Integration
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    projects = db.relationship('Project', backref='owner', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), default='General')
    description = db.Column(db.Text, nullable=True)
    initial_investment = db.Column(db.Float, nullable=False, default=0.0)
    duration = db.Column(db.Integer, nullable=False, default=5)
    discount_rate = db.Column(db.Float, nullable=False, default=10.0)
    fixed_costs = db.Column(db.Float, default=0.0)
    selling_price = db.Column(db.Float, default=0.0)
    variable_cost = db.Column(db.Float, default=0.0)
    projected_units = db.Column(db.Integer, default=0)
    is_sample = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(50), default='Active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cash_flows = db.relationship('CashFlow', backref='project', cascade='all, delete-orphan', lazy='joined')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'initialInvestment': self.initial_investment,
            'duration': self.duration,
            'discountRate': self.discount_rate,
            'fixedCosts': self.fixed_costs,
            'sellingPrice': self.selling_price,
            'variableCost': self.variable_cost,
            'projectedUnits': self.projected_units,
            'isSample': self.is_sample,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'cashFlows': [cf.to_dict() for cf in sorted(self.cash_flows, key=lambda x: x.year)]
        }


class CashFlow(db.Model):
    __tablename__ = 'cash_flows'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.String(64), db.ForeignKey('projects.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    inflow = db.Column(db.Float, default=0.0)
    outflow = db.Column(db.Float, default=0.0)
    note = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'year': self.year,
            'inflow': self.inflow,
            'outflow': self.outflow,
            'note': self.note
        }
