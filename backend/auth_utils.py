import jwt
import requests
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from config import config
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

def create_jwt_token(user_data):
    """
    Crear un JWT token para el usuario
    """
    payload = {
        'user_id': user_data['userId'],
        'email': user_data['email'],
        'name': user_data['name'],
        'exp': datetime.utcnow() + timedelta(hours=config.JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(
        payload,
        config.JWT_SECRET_KEY,
        algorithm=config.JWT_ALGORITHM
    )
    
    return token

def verify_jwt_token(token):
    """
    Verificar y decodificar un JWT token
    """
    try:
        payload = jwt.decode(
            token,
            config.JWT_SECRET_KEY,
            algorithms=[config.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def verify_google_token(token):
    """
    Verificar un token de Google OAuth
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            config.GOOGLE_CLIENT_ID
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Token inválido')
        
        return {
            'sub': idinfo['sub'],
            'email': idinfo['email'],
            'name': idinfo.get('name', ''),
            'picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False)
        }
    except ValueError as e:
        print(f"Error verificando token de Google: {e}")
        return None

def get_google_provider_cfg():
    """
    Obtener la configuración de Google OAuth
    """
    return requests.get(config.GOOGLE_DISCOVERY_URL).json()

def token_required(f):
    """
    Decorador para rutas que requieren autenticación
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Token malformado'}), 401
        
        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401
        
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        
        return f(current_user=payload, *args, **kwargs)
    
    return decorated

def generate_user_id(email):
    """
    Generar un user_id único basado en el email
    """
    import hashlib
    hash_object = hashlib.md5(email.encode())
    return hash_object.hexdigest()[:12]