import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/apiService';
import { Tree, CareRecord, CareReminder, DashboardStats } from '../types/dashboard';

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
      
      // Use real API data (authentication bypassed on backend)
      const response = await apiService.getTrees({ limit: 100 });
      
      if (response.success && response.data) {
        setTrees(response.data.trees);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trees');
    } finally {
      setIsLoading(false);
    }
  };

  const addTree = async (treeData: Omit<Tree, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      // Use real API call (authentication bypassed on backend)
      const response = await apiService.addTree(treeData);
      
      if (response.success && response.data) {
        await refreshTrees(); // Refresh the trees list
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tree');
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
        // Update the tree in the local state
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
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTree = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('DashboardContext: Deleting tree with ID:', id);
      const response = await apiService.deleteTree(id);
      console.log('DashboardContext: Delete response:', response);
      
      if (response.success) {
        // Remove the tree from local state
        setTrees(prevTrees => {
          console.log('DashboardContext: Before deletion, trees count:', prevTrees.length);
          const filtered = prevTrees.filter(tree => tree.id !== id);
          console.log('DashboardContext: After deletion, trees count:', filtered.length);
          console.log('DashboardContext: Looking for tree with ID:', id);
          console.log('DashboardContext: Available tree IDs:', prevTrees.map(t => t.id));
          return filtered;
        });
        return true;
      } else {
        console.log('DashboardContext: Delete failed:', response.error);
        setError(response.error || 'Failed to delete tree');
        return false;
      }
    } catch (err) {
      console.error('DashboardContext: Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete tree');
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
      
      console.log('🔍 Context: Fetching care records...');
      
      // Use real API data (authentication bypassed on backend)
      const response = await apiService.getCareRecords({ limit: 100 });
      console.log('🔍 Context: Care records API response:', response);
      
      if (response.success && response.data) {
        const records = (response as any).data?.careRecords || (response as any).data || [];
        console.log('🔍 Context: Setting care records:', Array.isArray(records) ? records.length : 0, 'records');
        setCareRecords(records);
      }
    } catch (err) {
      console.error('🔍 Context: Error fetching care records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch care records');
    } finally {
      setIsLoading(false);
    }
  };

  const addCareRecord = async (careData: Omit<CareRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('🔍 Context: Adding care record with data:', careData);
      
      // Use real API call (authentication bypassed on backend)
      const response = await apiService.addCareRecord(careData);
      console.log('🔍 Context: API response:', response);
      
      if (response.success && response.data) {
        const created = (response as any).data;
        // Normalize id
        const normalized = { ...created, id: created._id || created.id } as CareRecord;
        // Optimistic update
        setCareRecords(prev => [normalized, ...prev]);
        // Also refresh stats in background (no blocking UI)
        refreshStats();
        return true;
      } else {
        console.log('🔍 Context: Failed to add care record - Full response:', response);
        console.log('🔍 Context: Error message:', response.error);
        console.log('🔍 Context: Response message:', response.message);
        setError(response.error || response.message || 'Failed to add care record');
        return false;
      }
    } catch (err) {
      console.error('🔍 Context: Error adding care record:', err);
      setError(err instanceof Error ? err.message : 'Failed to add care record');
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
      
      // Use real API data (authentication bypassed on backend)
      const response = await apiService.getCareReminders();
      
      if (response.success && response.data) {
        setReminders(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
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
        // Update the reminder in local state
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
      
      // Use real API data (authentication bypassed on backend)
      const response = await apiService.getDashboardStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
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
      return null;
    }
  };

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        refreshTrees(),
        refreshCareRecords(),
        refreshReminders(),
        refreshStats(),
      ]);
    };

    loadInitialData();
  }, []);

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
