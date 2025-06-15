// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './AppContent'; // Import the new AppContent component

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
