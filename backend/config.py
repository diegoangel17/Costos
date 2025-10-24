import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///financial_reports.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = 24
    
    # Google OAuth 2.0
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_DISCOVERY_URL = os.getenv(
        'GOOGLE_DISCOVERY_URL',
        'https://accounts.google.com/.well-known/openid-configuration'
    )
    
    # URLs
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
    
    # OAuth redirect URIs
    @property
    def GOOGLE_REDIRECT_URI(self):
        return f"{self.BACKEND_URL}/api/auth/google/callback"
    
    @property
    def ALLOWED_ORIGINS(self):
        return [self.FRONTEND_URL]

config = Config()