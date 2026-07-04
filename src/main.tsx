import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { theme } from './theme';

// Global styles
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif;
    background: ${theme.bgPage};
    color: ${theme.textPrimary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  input, select, textarea, button {
    font-family: inherit;
  }

  input:focus, select:focus {
    outline: none;
    border-color: ${theme.primary} !important;
  }

  ::selection {
    background: rgba(24, 113, 255, 0.2);
  }
`;

document.head.appendChild(globalStyle);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
