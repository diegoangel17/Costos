from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reports = db.relationship('Report', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)
    program_id = db.Column(db.Integer, nullable=True)
    date = db.Column(db.Date, nullable=False)
    data = db.Column(db.Text, nullable=False)
    totals = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'reportType': self.report_type,
            'programId': self.program_id,
            'date': self.date.isoformat(),
            'data': json.loads(self.data) if self.data else [],
            'totals': json.loads(self.totals) if self.totals else {},
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CuentaContable(db.Model):
    __tablename__ = 'cuentas_contables'
    
    id = db.Column(db.Integer, primary_key=True)
    cuenta = db.Column(db.String(100), unique=True, nullable=False)
    clasificacion = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'cuenta': self.cuenta,
            'clasificacion': self.clasificacion,
            'descripcion': self.descripcion
        }

