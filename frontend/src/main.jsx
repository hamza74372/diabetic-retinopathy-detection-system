// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { HistoryProvider } from './context/HistoryContext'; // 1. Import HistoryProvider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HistoryProvider> {/* 2. Wrap the App */}
          <App />
        </HistoryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);