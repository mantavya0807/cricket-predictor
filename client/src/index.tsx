// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove default loading state if you have one
if (document.getElementById('loading')) {
  document.getElementById('loading')?.remove();
}