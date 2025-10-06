import { Tree, CareRecord, GrowthMeasurement, CareReminder, DashboardStats } from '../types/dashboard';
import { API_CONFIG, getApiUrl, DEFAULT_HEADERS, ERROR_MESSAGES } from '../config/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginationResponse<T> {
  success: boolean;
  data: {
    trees?: T[];
    careRecords?: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTrees?: number;
      totalRecords?: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    console.log('[ApiService] BASE_URL =', this.baseURL);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      ...DEFAULT_HEADERS,
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for CORS
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Tree Management
  async getTrees(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginationResponse<Tree>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/dashboard/trees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(endpoint);
    
    // Transform _id to id for frontend compatibility
    if (response.success && response.data && response.data.trees) {
      response.data.trees = response.data.trees.map((tree: any) => ({
        ...tree,
        id: tree._id || tree.id
      }));
    }
    
    return response as PaginationResponse<Tree>;
  }

  async getTreeById(id: string): Promise<ApiResponse<{
    tree: Tree;
    recentCareRecords: CareRecord[];
    recentGrowthMeasurements: GrowthMeasurement[];
    upcomingReminders: CareReminder[];
  }>> {
    return this.request<{
      tree: Tree;
      recentCareRecords: CareRecord[];
      recentGrowthMeasurements: GrowthMeasurement[];
      upcomingReminders: CareReminder[];
    }>(`/dashboard/trees/${id}`);
  }

  async addTree(treeData: Omit<Tree, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Tree>> {
    return this.request<Tree>('/dashboard/trees', {
      method: 'POST',
      body: JSON.stringify(treeData),
    });
  }

  async updateTree(id: string, updates: Partial<Tree>): Promise<ApiResponse<Tree>> {
    return this.request<Tree>(`/dashboard/trees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTree(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/dashboard/trees/${id}`, {
      method: 'DELETE',
    });
  }

  // Care Records
  async getCareRecords(params?: {
    treeId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<CareRecord>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/dashboard/care-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(endpoint);
    
    // Transform _id to id for frontend compatibility
    if (response.success && response.data && response.data.careRecords) {
      response.data.careRecords = response.data.careRecords.map((record: any) => ({
        ...record,
        id: record._id || record.id
      }));
    }
    
    return response as PaginationResponse<CareRecord>;
  }

  async addCareRecord(careData: Omit<CareRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CareRecord>> {
    const response = await this.request<any>('/dashboard/care-records', {
      method: 'POST',
      body: JSON.stringify(careData),
    });
    
    // Transform _id to id for frontend compatibility
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        id: response.data._id || response.data.id
      };
    }
    
    return response as ApiResponse<CareRecord>;
  }

  async updateCareRecord(id: string, updates: Partial<CareRecord>): Promise<ApiResponse<CareRecord>> {
    return this.request<CareRecord>(`/dashboard/care-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Growth Measurements
  async getGrowthMeasurements(treeId: string): Promise<ApiResponse<GrowthMeasurement[]>> {
    return this.request<GrowthMeasurement[]>(`/dashboard/trees/${treeId}/growth-measurements`);
  }

  async addGrowthMeasurement(measurementData: Omit<GrowthMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<GrowthMeasurement>> {
    return this.request<GrowthMeasurement>('/dashboard/growth-measurements', {
      method: 'POST',
      body: JSON.stringify(measurementData),
    });
  }

  // Care Reminders
  async getCareReminders(params?: {
    type?: string;
    isCompleted?: boolean;
    overdue?: boolean;
  }): Promise<ApiResponse<CareReminder[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/dashboard/care-reminders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<CareReminder[]>(endpoint);
  }

  async markReminderCompleted(id: string): Promise<ApiResponse<CareReminder>> {
    return this.request<CareReminder>(`/dashboard/care-reminders/${id}/complete`, {
      method: 'PATCH',
    });
  }

  // Analytics
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getAnalyticsReport(period: string = '6months'): Promise<ApiResponse<any>> {
    return this.request<any>(`/dashboard/analytics/report?period=${period}`);
  }

  async getGrowthTrendData(months: number = 6): Promise<ApiResponse<any>> {
    return this.request<any>(`/dashboard/analytics/growth-trend?months=${months}`);
  }

  async getCommunityAnalytics(): Promise<ApiResponse<any>> {
    return this.request<any>(`/dashboard/analytics/community`);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;