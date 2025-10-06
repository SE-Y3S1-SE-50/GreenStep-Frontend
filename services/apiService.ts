import { Tree, CareRecord, GrowthMeasurement, CareReminder, DashboardStats } from '../types/dashboard';
import { API_CONFIG, getApiUrl, DEFAULT_HEADERS, ERROR_MESSAGES } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginationResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
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
  private token: string | null = null;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    // Log resolved base URL for easier debugging on device/emulator
    // eslint-disable-next-line no-console
    console.log('[ApiService] BASE_URL =', this.baseURL);
    // Load token asynchronously
    this.initializeToken();
  }

  private async initializeToken(): Promise<void> {
    await this.loadToken();
  }

  private async loadToken(): Promise<void> {
    try {
      // In a real app, you might store this in secure storage
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error loading token:', error);
      this.token = null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async clearToken(): Promise<void> {
    try {
      this.token = null;
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
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

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      // Implement a timeout to avoid long-hanging requests
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
      // Re-throw to let callers handle via context and show user-friendly alerts
      throw error;
    }
  }

  // Authentication methods
  async login(username: string, password: string): Promise<ApiResponse<{ role: string }>> {
    const response = await this.request<{ role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success) {
      // The token should be set via cookies, but we'll also store it locally
      // In a real app, you'd handle this more securely
      await this.setToken('mock_token'); // Replace with actual token handling
    }

    return response;
  }

  async register(userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/logout', { method: 'POST' });
    } finally {
      await this.clearToken();
    }
  }

  async checkAuth(): Promise<ApiResponse<{ role: string; id: string }>> {
    return this.request<{ role: string; id: string }>('/check-cookie');
  }

  // Tree management methods
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
    const response = await this.request<PaginationResponse<Tree>['data']>(endpoint) as PaginationResponse<Tree>;
    
    // Transform _id to id for frontend compatibility
    if (response.success && response.data && response.data.trees) {
      console.log('🔍 API: Transforming tree IDs...');
      response.data.trees = response.data.trees.map(tree => {
        const transformedTree = {
          ...tree,
          id: tree._id || tree.id
        };
        console.log('🔍 API: Tree transformation:', {
          original: { _id: tree._id, id: tree.id },
          transformed: { id: transformedTree.id }
        });
        return transformedTree;
      });
    }
    
    return response;
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
    console.log('ApiService: Deleting tree with ID:', id);
    console.log('ApiService: Making DELETE request to:', `/dashboard/trees/${id}`);
    
    const response = await this.request<{ message: string }>(`/dashboard/trees/${id}`, {
      method: 'DELETE',
    });
    
    console.log('ApiService: Delete response:', response);
    return response;
  }

  // Care records methods
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
    console.log('🔍 API: Fetching care records from:', endpoint);
    
    const response = await this.request<PaginationResponse<CareRecord>['data']>(endpoint) as PaginationResponse<CareRecord>;
    console.log('🔍 API: Care records response:', response);
    
    // Transform _id to id for frontend compatibility
    if (response.success && response.data && response.data.careRecords) {
      console.log('🔍 API: Transforming care records IDs...');
      response.data.careRecords = response.data.careRecords.map(record => ({
        ...record,
        id: record._id || record.id
      }));
      console.log('🔍 API: Transformed care records:', response.data.careRecords.length, 'records');
    }
    
    return response;
  }

  async addCareRecord(careData: Omit<CareRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CareRecord>> {
    console.log('🔍 API: Adding care record with data:', careData);
    
    const response = await this.request<CareRecord>('/dashboard/care-records', {
      method: 'POST',
      body: JSON.stringify(careData),
    });
    
    console.log('🔍 API: Add care record response:', response);
    
    // Transform _id to id for frontend compatibility
    if (response.success && response.data) {
      response.data = {
        ...response.data,
        id: response.data._id || response.data.id
      };
      console.log('🔍 API: Transformed care record:', response.data);
    }
    
    return response;
  }

  async updateCareRecord(id: string, updates: Partial<CareRecord>): Promise<ApiResponse<CareRecord>> {
    return this.request<CareRecord>(`/dashboard/care-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Growth measurements methods
  async getGrowthMeasurements(treeId: string): Promise<ApiResponse<GrowthMeasurement[]>> {
    return this.request<GrowthMeasurement[]>(`/dashboard/trees/${treeId}/growth-measurements`);
  }

  async addGrowthMeasurement(measurementData: Omit<GrowthMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<GrowthMeasurement>> {
    return this.request<GrowthMeasurement>('/dashboard/growth-measurements', {
      method: 'POST',
      body: JSON.stringify(measurementData),
    });
  }

  // Care reminders methods
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

  // Analytics methods
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
    return this.request<any>('/dashboard/analytics/community');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
