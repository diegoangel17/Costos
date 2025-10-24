from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Report, CuentaContable
from datetime import datetime
from oauthlib.oauth2 import WebApplicationClient
import json
import os
import requests

# Importar configuración y utilidades de autenticación
from config import config
from auth_utils import (
    create_jwt_token,
    verify_jwt_token,
    verify_google_token,
    get_google_provider_cfg,
    token_required,
    generate_user_id
)

app = Flask(__name__)

# Configuración CORS
CORS(app, resources={
    r"/api/*": {
        "origins": config.ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configuración de la app
app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = config.SECRET_KEY

db.init_app(app)

# Cliente OAuth
oauth_client = WebApplicationClient(config.GOOGLE_CLIENT_ID)

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

# ==================== RUTAS DE AUTENTICACIÓN OAUTH ====================

@app.route('/api/auth/google/login', methods=['GET'])
def google_login():
    """
    Iniciar el flujo de autenticación con Google
    """
    try:
        google_provider_cfg = get_google_provider_cfg()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]
        
        request_uri = oauth_client.prepare_request_uri(
            authorization_endpoint,
            redirect_uri=config.GOOGLE_REDIRECT_URI,
            scope=["openid", "email", "profile"],
        )
        
        return jsonify({
            'success': True,
            'authorization_url': request_uri
        }), 200
        
    except Exception as e:
        print(f"❌ Error en google_login: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/google/callback', methods=['GET'])
def google_callback():
    """
    Callback de Google OAuth
    """
    try:
        code = request.args.get("code")
        
        if not code:
            return redirect(f"{config.FRONTEND_URL}?error=no_code")
        
        google_provider_cfg = get_google_provider_cfg()
        token_endpoint = google_provider_cfg["token_endpoint"]
        
        token_url, headers, body = oauth_client.prepare_token_request(
            token_endpoint,
            authorization_response=request.url,
            redirect_url=config.GOOGLE_REDIRECT_URI,
            code=code
        )
        
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET),
        )
        
        oauth_client.parse_request_body_response(json.dumps(token_response.json()))
        
        userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
        uri, headers, body = oauth_client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)
        
        userinfo = userinfo_response.json()
        
        if not userinfo.get("email_verified"):
            return redirect(f"{config.FRONTEND_URL}?error=email_not_verified")
        
        email = userinfo["email"]
        name = userinfo.get("name", email.split('@')[0])
        picture = userinfo.get("picture", "")
        google_id = userinfo["sub"]
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            user_id = generate_user_id(email)
            user = User(
                user_id=user_id,
                name=name,
                email=email,
                password_hash="",  # No se usa contraseña con OAuth
                google_id=google_id,
                picture=picture,
                auth_provider='google'
            )
            db.session.add(user)
            db.session.commit()
        else:
            if not user.google_id:
                user.google_id = google_id
                user.auth_provider = 'google'
            if not user.picture:
                user.picture = picture
            db.session.commit()
        
        jwt_token = create_jwt_token(user.to_dict())
        
        redirect_url = f"{config.FRONTEND_URL}?token={jwt_token}&user={user.user_id}"
        return redirect(redirect_url)
        
    except Exception as e:
        print(f"❌ Error en google_callback: {str(e)}")
        return redirect(f"{config.FRONTEND_URL}?error={str(e)}")

@app.route('/api/auth/google/verify', methods=['POST'])
def verify_google_token_route():
    """
    Verificar un token de Google y crear sesión
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 400
        
        google_info = verify_google_token(token)
        
        if not google_info:
            return jsonify({'error': 'Token inválido'}), 401
        
        if not google_info['email_verified']:
            return jsonify({'error': 'Email no verificado'}), 401
        
        email = google_info['email']
        name = google_info['name'] or email.split('@')[0]
        picture = google_info.get('picture', '')
        google_id = google_info['sub']
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            user_id = generate_user_id(email)
            user = User(
                user_id=user_id,
                name=name,
                email=email,
                password_hash="",
                google_id=google_id,
                picture=picture,
                auth_provider='google'
            )
            db.session.add(user)
            db.session.commit()
        else:
            if not user.google_id:
                user.google_id = google_id
                user.auth_provider = 'google'
            if not user.picture:
                user.picture = picture
            db.session.commit()
        
        jwt_token = create_jwt_token(user.to_dict())
        
        return jsonify({
            'success': True,
            'token': jwt_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"❌ Error en verify_google_token: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ==================== RUTAS DE AUTENTICACIÓN TRADICIONAL ====================

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
            password_hash=generate_password_hash(data['password']),
            auth_provider='local'
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        jwt_token = create_jwt_token(new_user.to_dict())
        
        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'token': jwt_token,
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
        
        jwt_token = create_jwt_token(user.to_dict())
        
        return jsonify({
            'success': True,
            'message': 'Login exitoso',
            'token': jwt_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    """
    Verificar si el token es válido
    """
    return jsonify({
        'success': True,
        'user': current_user
    }), 200

# ==================== RUTAS DE CUENTAS ====================

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

# ==================== RUTAS DE REPORTES ====================

@app.route('/api/reports', methods=['GET'])
@token_required
def get_reports(current_user):
    try:
        user_id = current_user['user_id']
        
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
@token_required
def get_report_by_id(current_user, report_id):
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
@token_required
def create_report(current_user):
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['name', 'reportType', 'date', 'data']):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        user_id = current_user['user_id']
        user = User.query.filter_by(user_id=user_id).first()
        
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
        print(f"❌ Error al guardar reporte: {str(e)}")
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