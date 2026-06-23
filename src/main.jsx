import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';                 // initialise i18next before the app mounts
import './index.css';             // Tailwind v4 + theme tokens
import './styles/global.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
