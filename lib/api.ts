// API client configuration and service layer

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiError {
  message: string;
  errors?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || 'An error occurred',
          errors: data.errors,
        };
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(`${API_URL}/api`);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{
      success: boolean;
      data: {
        user: any;
        token: string;
        refreshToken: string;
      }
    }>('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    company?: string;
  }) =>
    apiClient.post<{ success: boolean; data: any }>('/auth/register', data),

  getProfile: () =>
    apiClient.get<{ success: boolean; data: any }>('/auth/profile'),

  logout: () =>
    apiClient.post<{ success: boolean }>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{
      success: boolean;
      data: { token: string; refreshToken: string }
    }>('/auth/refresh', { refreshToken }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put<{ success: boolean }>('/auth/change-password', {
      currentPassword,
      newPassword,
    }),
};

// Companies API
export const companiesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; industry?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.industry) queryParams.append('industry', params.industry);

    const query = queryParams.toString();
    return apiClient.get<{
      success: boolean;
      data: {
        companies: any[];
        pagination?: {
          totalPages: number;
          currentPage: number;
          total: number;
          limit: number;
        };
        // Legacy support
        totalPages?: number;
        currentPage?: number;
        total?: number;
      }
    }>(
      `/companies${query ? `?${query}` : ''}`
    );
  },

  getById: (companyId: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/companies/${companyId}`),

  create: (data: { name: string; representative: string; description?: string; registrationNumber?: string }) =>
    apiClient.post<{ success: boolean; data: any }>('/companies', data),

  update: (companyId: string, data: { name?: string; description?: string }) =>
    apiClient.put<{ success: boolean; data: any }>(`/companies/${companyId}`, data),

  delete: (companyId: string) =>
    apiClient.delete<{ success: boolean }>(`/companies/${companyId}`),

  inviteCA: (companyId: string, caId: string) =>
    apiClient.post<{ success: boolean }>(`/companies/${companyId}/invite-ca`, { caId }),

  removeCA: (companyId: string, caId: string) =>
    apiClient.delete<{ success: boolean }>(`/companies/${companyId}/ca/${caId}`),

  addAdmin: (companyId: string, userId: string) =>
    apiClient.post<{ success: boolean }>(`/companies/${companyId}/admins`, { userId }),

  removeAdmin: (companyId: string, userId: string) =>
    apiClient.delete<{ success: boolean }>(`/companies/${companyId}/admins/${userId}`),
};

// Users API
export const usersApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; data: any[] }>('/users'),

  getById: (userId: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/users/${userId}`),

  update: (userId: string, data: any) =>
    apiClient.put<{ success: boolean; data: any }>(`/users/${userId}`, data),

  updateRole: (userId: string, role: string) =>
    apiClient.put<{ success: boolean; data: any }>(`/users/${userId}/role`, { role }),

  deactivate: (userId: string) =>
    apiClient.put<{ success: boolean }>(`/users/${userId}/deactivate`),

  activate: (userId: string) =>
    apiClient.put<{ success: boolean }>(`/users/${userId}/activate`),

  delete: (userId: string) =>
    apiClient.delete<{ success: boolean }>(`/users/${userId}`),
};

// Documents API
export const documentsApi = {
  upload: async (files: File[], companyId: string, category?: string) => {
    const token = apiClient['getAuthToken']();
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('companyId', companyId);
    if (category) {
      formData.append('category', category);
    }

    const response = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },

  getByCompany: (companyId: string, params?: { status?: string; category?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return apiClient.get<{
      success: boolean;
      data: {
        documents: any[];
        totalPages: number;
        currentPage: number;
        total: number;
      }
    }>(`/documents/company/${companyId}${query ? `?${query}` : ''}`);
  },

  getById: (documentId: string) =>
    apiClient.get<{ success: boolean; data: { document: any } }>(`/documents/${documentId}`),

  delete: (documentId: string) =>
    apiClient.delete<{ success: boolean }>(`/documents/${documentId}`),

  updateStatus: (documentId: string, status: string, analysisId?: string) =>
    apiClient.put<{ success: boolean; data: { document: any } }>(
      `/documents/${documentId}/status`,
      { status, analysisId }
    ),
};

// Analysis API (Node.js backend)
export const analysisApi = {
  // Get analysis by ID
  getById: (analysisId: string) =>
    apiClient.get<{ success: boolean; data: any }>(`/analysis/${analysisId}`),

  // Get company analysis history
  getHistory: (companyId: string, limit: number = 50) =>
    apiClient.get<{ success: boolean; data: any }>(`/analysis/history/company/${companyId}?limit=${limit}`),

  // Compare company analyses
  compare: (companyId: string, params?: { analysisIds?: string[]; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.analysisIds) queryParams.append('analysisIds', params.analysisIds.join(','));
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return apiClient.get<{ success: boolean; data: any }>(`/analysis/compare/company/${companyId}${query ? `?${query}` : ''}`);
  },

  // Trigger analysis (proxy to Python)
  trigger: (documentIds: string[], companyId: string, companyName: string, analysisType: string = 'comprehensive', industry?: string, benchmarkId?: string) =>
    apiClient.post<{ success: boolean; data: any }>('/analysis/trigger', {
      documentIds,
      companyId,
      companyName,
      analysisType,
      industry,
      benchmarkId
    }),

  // Export analysis as PDF
  exportPDF: async (analysisId: string, charts: Record<string, string>): Promise<Blob> => {
    const token = apiClient['getAuthToken']();
    const response = await fetch(`${API_URL}/api/pdf/analysis/${analysisId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ charts }),
    });

    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }

    return await response.blob();
  },
};

// Benchmarks API
export const benchmarksApi = {
  getAll: (industry?: string) => {
    const query = industry ? `?industry=${industry}` : '';
    return apiClient.get<{ success: boolean; data: { benchmarks: any[] } }>(`/benchmarks${query}`);
  },

  getById: (benchmarkId: string) =>
    apiClient.get<{ success: boolean; data: { benchmark: any } }>(`/benchmarks/${benchmarkId}`),

  getDefault: (industry: string = 'General') =>
    apiClient.get<{ success: boolean; data: { benchmark: any } }>(`/benchmarks/default?industry=${industry}`),

  getIndustries: () =>
    apiClient.get<{ success: boolean; data: { industries: string[] } }>('/benchmarks/industries'),

  create: (data: any) =>
    apiClient.post<{ success: boolean; data: { benchmark: any } }>('/benchmarks', data),

  update: (benchmarkId: string, data: any) =>
    apiClient.put<{ success: boolean; data: { benchmark: any } }>(`/benchmarks/${benchmarkId}`, data),

  delete: (benchmarkId: string) =>
    apiClient.delete<{ success: boolean }>(`/benchmarks/${benchmarkId}`),
};

// Analysis Notes API
export const analysisNotesApi = {
  getByAnalysis: (analysisId: string) =>
    apiClient.get<{ success: boolean; data: { notes: any[] } }>(`/analysis-notes/analysis/${analysisId}`),

  getByCompany: (companyId: string) =>
    apiClient.get<{ success: boolean; data: { notes: any[] } }>(`/analysis-notes/company/${companyId}`),

  create: (data: {
    analysisId: string;
    title?: string;
    content: string;
    noteType?: 'general' | 'concern' | 'recommendation' | 'highlight';
    isPrivate?: boolean;
    attachments?: any[];
  }) =>
    apiClient.post<{ success: boolean; data: { note: any } }>('/analysis-notes', data),

  update: (noteId: string, data: {
    title?: string;
    content?: string;
    noteType?: 'general' | 'concern' | 'recommendation' | 'highlight';
    isPrivate?: boolean;
    attachments?: any[];
  }) =>
    apiClient.put<{ success: boolean; data: { note: any } }>(`/analysis-notes/${noteId}`, data),

  delete: (noteId: string) =>
    apiClient.delete<{ success: boolean }>(`/analysis-notes/${noteId}`),
};

// Admin API
export const adminApi = {
  // Dashboard Analytics
  getAnalytics: () =>
    apiClient.get<{
      success: boolean;
      data: {
        overview: any;
        growth: any;
        companiesByIndustry: any[];
        topCAs: any[];
        recentActivities: any[];
        systemHealth: any;
      }
    }>('/admin/analytics'),

  // CA Management
  getAllCAs: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiClient.get<{
      success: boolean;
      data: {
        cas: any[];
        totalPages: number;
        currentPage: number;
        total: number;
      }
    }>(`/admin/cas${query ? `?${query}` : ''}`);
  },

  getCADetails: (caId: string) =>
    apiClient.get<{
      success: boolean;
      data: {
        ca: any;
        assignedCompanies: any[];
        invitedCompanies: any[];
        stats: any;
        recentAnalyses: any[];
      }
    }>(`/admin/cas/${caId}`),

  createCA: (data: { name: string; email: string; password: string }) =>
    apiClient.post<{ success: boolean; data: { ca: any } }>('/admin/cas', data),

  updateCA: (caId: string, data: { name?: string; email?: string; isActive?: boolean }) =>
    apiClient.put<{ success: boolean; data: { ca: any } }>(`/admin/cas/${caId}`, data),

  deleteCA: (caId: string) =>
    apiClient.delete<{ success: boolean }>(`/admin/cas/${caId}`),

  assignCompanies: (caId: string, companyIds: string[]) =>
    apiClient.post<{ success: boolean; data: { ca: any } }>(
      `/admin/cas/${caId}/assign-companies`,
      { companyIds }
    ),

  removeCompanies: (caId: string, companyIds: string[]) =>
    apiClient.post<{ success: boolean }>(`/admin/cas/${caId}/remove-companies`, { companyIds }),
};

/**
 * CA Dashboard API
 */
export const caApi = {
  getDashboard: () =>
    apiClient.get<{
      success: boolean;
      data: {
        metrics: {
          assignedCompanies: number;
          newCompaniesThisMonth: number;
          totalAnalyses: number;
          recentAnalyses: number;
          totalDocuments: number;
          recentDocuments: number;
          analysisStatus: {
            completed: number;
            processing: number;
            failed: number;
          };
          successRate: number;
        };
        recentActivities: Array<{
          type: string;
          action: string;
          company: string;
          timestamp: string;
          status: string;
          analysisId?: string;
        }>;
        companies: Array<{
          _id: string;
          name: string;
          industry: string;
          totalAnalyses: number;
          totalDocuments: number;
          lastAnalysisDate: string | null;
          lastAnalysisStatus: string | null;
          daysSinceLastActivity: number | null;
        }>;
        companiesNeedingAttention: any[];
        analysisTrend: Array<{
          _id: string;
          count: number;
        }>;
      };
    }>('/ca/dashboard'),
};

export default apiClient;
