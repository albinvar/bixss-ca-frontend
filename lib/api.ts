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
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiClient.get<{
      success: boolean;
      data: {
        companies: any[];
        totalPages: number;
        currentPage: number;
        total: number;
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
  trigger: (documentIds: string[], companyId: string, companyName: string, analysisType: string = 'comprehensive') =>
    apiClient.post<{ success: boolean; data: any }>('/analysis/trigger', {
      documentIds,
      companyId,
      companyName,
      analysisType
    }),
};

export default apiClient;
