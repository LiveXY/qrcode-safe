import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppRoute } from './types';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Read from './pages/Read';

const AppContent: React.FC = () => {
  const { route } = useApp();

  // Simple Router based on state
  const renderPage = () => {
    switch (route) {
      case AppRoute.HOME:
        return <Home />;
      case AppRoute.SCAN:
        return <Scan />;
      case AppRoute.READ:
        return <Read />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="h-full w-full">
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
