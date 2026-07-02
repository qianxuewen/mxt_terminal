import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
    background: #0a0a14;
    color: #ffffff;
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
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  input, select, textarea, button {
    font-family: inherit;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #4a6cf7 !important;
  }

  ::selection {
    background: rgba(74, 108, 247, 0.3);
  }
`;

document.head.appendChild(globalStyle);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
