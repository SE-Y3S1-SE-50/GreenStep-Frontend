import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../../services/apiService';
import { Tree, CareRecord, CareReminder, DashboardStats } from '../../types/dashboard';

interface DashboardContextType {
  // State
  trees: Tree[];
  careRecords: CareRecord[];
  reminders: CareReminder[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Tree management
  addTree: (treeData: Omit<Tree, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTree: (id: string, updates: Partial<Tree>) => Promise<boolean>;
  deleteTree: (id: string) => Promise<boolean>;
  refreshTrees: () => Promise<void>;
  
  // Care records
  addCareRecord: (careData: Omit<CareRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  refreshCareRecords: () => Promise<void>;
  
  // Care reminders
  markReminderCompleted: (id: string) => Promise<boolean>;
  refreshReminders: () => Promise<void>;
  
  // Analytics
  refreshStats: () => Promise<void>;
  getAnalyticsData: (type: string, params?: any) => Promise<any>;
  
  // Utility
  clearError: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [careRecords, setCareRecords] = useState<CareRecord[]>([]);
  const [reminders, setReminders] = useState<CareReminder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Tree management methods
  const refreshTrees = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.getTrees({ limit: 100 });
      
      if (response.success && response.data && response.data.trees) {
        setTrees(response.data.trees);
      } else {
        setTrees([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trees');
      console.error('Error fetching trees:', err);
      setTrees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addTree = async (treeData: Omit<Tree, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.addTree(treeData);
      
      if (response.success && response.data) {
        await refreshTrees();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tree');
      console.error('Error adding tree:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTree = async (id: string, updates: Partial<Tree>): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.updateTree(id, updates);
      
      if (response.success && response.data) {
        setTrees(prevTrees => 
          prevTrees.map(tree => 
            tree.id === id ? { ...tree, ...updates } : tree
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tree');
      console.error('Error updating tree:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTree = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.deleteTree(id);
      
      if (response.success) {
        setTrees(prevTrees => prevTrees.filter(tree => tree.id !== id));
        return true;
      } else {
        setError(response.error || 'Failed to delete tree');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tree');
      console.error('Error deleting tree:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Care records methods
  const refreshCareRecords = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.getCareRecords({ limit: 100 });
      
      if (response.success && response.data && response.data.careRecords) {
        setCareRecords(response.data.careRecords);
      } else {
        setCareRecords([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch care records');
      console.error('Error fetching care records:', err);
      setCareRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addCareRecord = async (careData: Omit<CareRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.addCareRecord(careData);
      
      if (response.success && response.data) {
        const normalized = { ...response.data, id: response.data._id || response.data.id } as CareRecord;
        setCareRecords(prev => [normalized, ...prev]);
        refreshStats();
        return true;
      } else {
        setError(response.error || response.message || 'Failed to add care record');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add care record');
      console.error('Error adding care record:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Care reminders methods
  const refreshReminders = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.getCareReminders();
      
      if (response.success && response.data) {
        setReminders(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markReminderCompleted = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.markReminderCompleted(id);
      
      if (response.success && response.data) {
        setReminders(prevReminders => 
          prevReminders.map(reminder => 
            reminder.id === id ? { ...reminder, isCompleted: true } : reminder
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark reminder as completed');
      console.error('Error marking reminder:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics methods
  const refreshStats = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await apiService.getDashboardStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalyticsData = async (type: string, params?: any): Promise<any> => {
    try {
      clearError();
      
      let response;
      switch (type) {
        case 'growthTrend':
          response = await apiService.getGrowthTrendData(params?.months || 6);
          break;
        case 'analyticsReport':
          response = await apiService.getAnalyticsReport(params?.period || '6months');
          break;
        case 'community':
          response = await apiService.getCommunityAnalytics();
          break;
        default:
          throw new Error(`Unknown analytics type: ${type}`);
      }
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch ${type} data`);
      console.error(`Error fetching ${type} data:`, err);
      return null;
    }
  };

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadInitialData = async () => {
        await Promise.all([
          refreshTrees(),
          refreshCareRecords(),
          refreshReminders(),
          refreshStats(),
        ]);
      };

      loadInitialData();
    } else {
      // Clear data when user logs out
      setTrees([]);
      setCareRecords([]);
      setReminders([]);
      setStats(null);
    }
  }, [isAuthenticated]);

  const value: DashboardContextType = {
    // State
    trees,
    careRecords,
    reminders,
    stats,
    isLoading,
    error,
    
    // Tree management
    addTree,
    updateTree,
    deleteTree,
    refreshTrees,
    
    // Care records
    addCareRecord,
    refreshCareRecords,
    
    // Care reminders
    markReminderCompleted,
    refreshReminders,
    
    // Analytics
    refreshStats,
    getAnalyticsData,
    
    // Utility
    clearError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};