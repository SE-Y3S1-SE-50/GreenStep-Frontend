// contexts/DashboardContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// 👉 Change this to your backend base URL
const API_URL = 'http://<YOUR_BACKEND_IP>:5000/api/dashboard';

interface DashboardData {
  totalParcels: number;
  deliveredParcels: number;
  pendingParcels: number;
  revenue: number;
}

interface DashboardContextType {
  data: DashboardData | null;
  loading: boolean;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboard();
    } else {
      setData(null);
    }
  }, [isAuthenticated]);

  const refreshDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: DashboardContextType = {
    data,
    loading,
    refreshDashboard,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
