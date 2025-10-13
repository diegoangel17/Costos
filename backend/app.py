from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Report, CuentaContable
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///financial_reports.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'

db.init_app(app)

with app.app_context():
    db.create_all()
    
    if CuentaContable.query.count() == 0:
        cuentas_iniciales = [
            {'cuenta': 'Caja', 'clasificacion': 'Activo', 'descripcion': 'Efectivo disponible'},
            {'cuenta': 'Bancos', 'clasificacion': 'Activo', 'descripcion': 'Depósitos bancarios'},
            {'cuenta': 'Clientes', 'clasificacion': 'Activo', 'descripcion': 'Cuentas por cobrar'},
            {'cuenta': 'Inventarios', 'clasificacion': 'Activo', 'descripcion': 'Mercancías en almacén'},
            {'cuenta': 'Equipo de Transporte', 'clasificacion': 'Activo', 'descripcion': 'Vehículos'},
            {'cuenta': 'Mobiliario y Equipo', 'clasificacion': 'Activo', 'descripcion': 'Muebles y equipos'},
            {'cuenta': 'Edificio', 'clasificacion': 'Activo', 'descripcion': 'Inmuebles'},
            {'cuenta': 'Terrenos', 'clasificacion': 'Activo', 'descripcion': 'Propiedades'},
            {'cuenta': 'Proveedores', 'clasificacion': 'Pasivo', 'descripcion': 'Cuentas por pagar'},
            {'cuenta': 'Documentos por Pagar', 'clasificacion': 'Pasivo', 'descripcion': 'Obligaciones'},
            {'cuenta': 'Acreedores Diversos', 'clasificacion': 'Pasivo', 'descripcion': 'Otras cuentas'},
            {'cuenta': 'Hipotecas por Pagar', 'clasificacion': 'Pasivo', 'descripcion': 'Préstamos'},
            {'cuenta': 'Capital Social', 'clasificacion': 'Capital', 'descripcion': 'Aportaciones'},
            {'cuenta': 'Utilidad del Ejercicio', 'clasificacion': 'Capital', 'descripcion': 'Ganancias'},
            {'cuenta': 'Reserva Legal', 'clasificacion': 'Capital', 'descripcion': 'Reservas'}
        ]
        
        for cuenta_data in cuentas_iniciales:
            cuenta = CuentaContable(**cuenta_data)
            db.session.add(cuenta)
        
        db.session.commit()
        print("✓ Cuentas contables inicializadas")

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['userId', 'name', 'email', 'password']):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        if User.query.filter_by(user_id=data['userId']).first():
            return jsonify({'error': 'El ID de usuario ya existe'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'El correo ya está registrado'}), 400
        
        new_user = User(
            user_id=data['userId'],
            name=data['name'],
            email=data['email'],
            password_hash=generate_password_hash(data['password'])
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['userId', 'password']):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        user = User.query.filter_by(user_id=data['userId']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        return jsonify({
            'success': True,
            'message': 'Login exitoso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cuentas', methods=['GET'])
def get_cuentas():
    try:
        cuentas = CuentaContable.query.all()
        return jsonify({
            'success': True,
            'cuentas': [cuenta.to_dict() for cuenta in cuentas]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cuentas', methods=['POST'])
def create_cuenta():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['cuenta', 'clasificacion']):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        nueva_cuenta = CuentaContable(
            cuenta=data['cuenta'],
            clasificacion=data['clasificacion'],
            descripcion=data.get('descripcion', '')
        )
        
        db.session.add(nueva_cuenta)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'cuenta': nueva_cuenta.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        user_id = request.args.get('userId')
        
        if not user_id:
            return jsonify({'error': 'userId es requerido'}), 400
        
        user = User.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        reports = Report.query.filter_by(user_id=user.id).order_by(Report.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'reports': [report.to_dict() for report in reports]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/reports/<int:report_id>', methods=['GET'])
def get_report_by_id(report_id):
    """Obtener un reporte específico por ID"""
    try:
        report = Report.query.get(report_id)
        
        if not report:
            return jsonify({
                'success': False,
                'error': 'Reporte no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'report': report.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reports', methods=['POST'])
def create_report():
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['userId', 'name', 'reportType', 'date', 'data']):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        user = User.query.filter_by(user_id=data['userId']).first()
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        new_report = Report(
            user_id=user.id,
            name=data['name'],
            report_type=data['reportType'],
            program_id=data.get('programId'),
            date=datetime.fromisoformat(data['date']),
            data=json.dumps(data['data']),
            totals=json.dumps(data.get('totals', {}))
        )
        
        db.session.add(new_report)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reporte creado exitosamente',
            'report': new_report.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'timestamp': datetime.utcnow().isoformat()
    }), 200



if __name__ == '__main__':
    app.run(debug=True, port=5000)