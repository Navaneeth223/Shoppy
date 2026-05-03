import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store';
import './index.css';

// Initialize i18n
import './services/i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A1E',
              color: '#F2F2F3',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: '"DM Sans", sans-serif',
            },
            success: {
              iconTheme: { primary: '#00C896', secondary: '#1A1A1E' },
            },
            error: {
              iconTheme: { primary: '#FF4D6D', secondary: '#1A1A1E' },
            },
          }}
        />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
