import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import FinancialSystem from './FinancialSystem';
import './index.css';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error('⚠️ VITE_GOOGLE_CLIENT_ID no está configurado en las variables de entorno');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <FinancialSystem />
    </GoogleOAuthProvider>
  );
}

export default App;