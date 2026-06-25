import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { LoginPromptProvider } from './context/LoginPromptContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoginPromptProvider>
          <App />
        </LoginPromptProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
