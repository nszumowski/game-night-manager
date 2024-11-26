import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './css/tailwind.css';

ReactDOM.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,

  React.createElement(
    React.StrictMode,
    null,
    React.createElement(App)
  ),
  document.getElementById('root')
);