import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppRoute } from '../types';

interface AppContextType {
  route: AppRoute;
  navigate: (route: AppRoute) => void;
  password: string;
  setPassword: (pwd: string) => void;
  tempData: string | null; // For passing data between scans and result views
  setTempData: (data: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [password, setPassword] = useState<string>('');
  const [tempData, setTempData] = useState<string | null>(null);

  const navigate = (newRoute: AppRoute) => {
    setRoute(newRoute);
  };

  return (
    <AppContext.Provider value={{ route, navigate, password, setPassword, tempData, setTempData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
